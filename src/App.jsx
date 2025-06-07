import { useState, useEffect, useRef } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import './App.css'

// Initialize Gemini API with proper configuration
const genAI = new GoogleGenerativeAI('AIzaSyDdTt_6hMJ7dRf8cb85ElD6m-EETIuxkgQ') // Replace with your actual API key

function App() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [streamingText, setStreamingText] = useState('')
  const animationContainerRef = useRef(null)
  const cleanupRef = useRef(null)

  const generateAnimation = async () => {
    setLoading(true)
    setError(null)
    setStreamingText('')
    
    try {
      // Get the model with latest configuration
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: 0.4, // Lower temperature for more focused outputs
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
      
      const systemInstruction = `You are an expert animation developer. Your task is to create smooth, performant animations using JavaScript.
      Always use requestAnimationFrame for animations and include proper cleanup.
      Focus on creating visually appealing and efficient animations.
      Return ONLY the JavaScript code, no explanations.
      IMPORTANT: 
      1. Do not use template literals in style properties. Use string concatenation instead.
      2. The code must be a complete function named 'createAnimation' that takes a container parameter.
      3. The function MUST return a cleanup function that removes all created elements and cancels any animations.
      4. Store the animation frame ID and use it in the cleanup function.
      5. Make the animation dynamic based on the user's prompt.`

      const promptText = `Create a JavaScript animation based on this text: "${prompt}". 
      The animation should be:
      1. Smooth and performant using requestAnimationFrame
      2. Visually appealing with proper timing and easing
      3. Responsive to container size
      4. Memory efficient with proper cleanup
      5. Dynamic and creative based on the prompt
      
      IMPORTANT: 
      1. Use string concatenation for style properties, not template literals.
      2. Example: element.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
      3. The code must be a complete function named 'createAnimation' that takes a container parameter.
      4. The function MUST return a cleanup function that:
         - Removes all created elements from the container
         - Cancels any running animations using cancelAnimationFrame
         - Clears any intervals or timeouts
      5. Make the animation creative and unique based on the prompt
      
      Return ONLY the JavaScript code in this exact format:
      function createAnimation(container) {
        // Store animation frame ID and elements
        let animationFrameId;
        let elements = [];
        
        // Create initial element
        const initialElement = document.createElement('div');
        initialElement.style.position = 'absolute';
        initialElement.style.width = '100px';
        initialElement.style.height = '100px';
        initialElement.style.backgroundColor = 'skyblue';
        initialElement.style.top = '50%';
        initialElement.style.left = '50%';
        initialElement.style.transform = 'translate(-50%, -50%)';
        container.appendChild(initialElement);
        elements.push(initialElement);
        
        // Animation function
        function animate() {
          const containerWidth = container.offsetWidth;
          const containerHeight = container.offsetHeight;
          let startTime = null;
          const duration = 2000;
          
          function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Update elements based on progress
            elements.forEach((element, index) => {
              // Add your animation logic here
              // Make it creative and dynamic based on the prompt
            });
            
            if (progress < 1) {
              animationFrameId = requestAnimationFrame(step);
            }
          }
          
          animationFrameId = requestAnimationFrame(step);
        }
        
        // Start the animation
        animate();
        
        // Return cleanup function
        return function cleanup() {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
          
          elements.forEach(element => {
            if (element && element.parentNode) {
              element.parentNode.removeChild(element);
            }
          });
          elements = [];
        };
      }`

      // Use streaming for better user experience
      const result = await model.generateContentStream({
        contents: [
          { role: "user", parts: [{ text: systemInstruction }] },
          { role: "model", parts: [{ text: "I understand. I will create animations following these guidelines." }] },
          { role: "user", parts: [{ text: promptText }] }
        ]
      })

      let fullResponse = ''
      for await (const chunk of result.stream) {
        const chunkText = chunk.text()
        fullResponse += chunkText
        setStreamingText(fullResponse)
      }

      // Strip markdown code block formatting
      fullResponse = fullResponse.replace(/```javascript\n?|\n?```/g, '').trim()
      console.log('Raw response:', fullResponse)

      // Ensure the response ends with a proper return statement
      if (!fullResponse.includes('return function cleanup()')) {
        // Add a default cleanup function if none is provided
        fullResponse = fullResponse.replace(
          /return\s*\(\s*\)\s*=>\s*{/g,
          'return function cleanup() {'
        )
      }

      console.log('Processed code:', fullResponse)

      // Clear previous animation
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
      
      if (animationContainerRef.current) {
        animationContainerRef.current.innerHTML = ''
      }

      // Create and execute the animation
      try {
        // Ensure the response is a complete function
        if (!fullResponse.includes('function createAnimation')) {
          console.error('Invalid code format:', fullResponse)
          throw new Error('Generated code is not a complete function')
        }

        // Create a new function from the response with a wrapper to ensure cleanup
        const wrappedCode = `
          try {
            ${fullResponse}
            const result = createAnimation(container);
            if (typeof result !== 'function') {
              console.warn('Animation did not return a cleanup function, using default cleanup');
              return function cleanup() {
                while (container.firstChild) {
                  container.removeChild(container.firstChild);
                }
              };
            }
            return result;
          } catch (error) {
            console.error('Error in animation:', error);
            return function cleanup() {
              while (container.firstChild) {
                container.removeChild(container.firstChild);
              }
            };
          }
        `;

        // Create a new function from the wrapped code
        console.log('Creating function from wrapped code');
        const createAnimationFn = new Function('container', wrappedCode);
        
        // Execute the function with the container
        console.log('Executing function...');
        const cleanup = createAnimationFn(animationContainerRef.current);
        
        // Verify that we got a cleanup function back
        if (typeof cleanup !== 'function') {
          console.error('Cleanup is not a function:', cleanup);
          throw new Error('Animation did not return a cleanup function. Make sure the function returns a cleanup function that removes elements and cancels animations.');
        }
        
        cleanupRef.current = cleanup;

      } catch (execError) {
        console.error('Error executing animation:', execError);
        setError('Failed to execute animation: ' + execError.message);
      }

    } catch (error) {
      console.error('Error generating animation:', error)
      setError(error.message || 'Failed to generate animation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Cleanup animation when component unmounts or when new animation is generated
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
        cleanupRef.current = null
      }
    }
  }, [])

  return (
    <div className="app">
      <h1>Prompt to Animation</h1>
      <div className="input-container">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here... For example: 'Create a box that moves from left to right' or 'Show a database splitting into SQL and NoSQL'"
          rows={4}
        />
        <button 
          onClick={generateAnimation}
          disabled={loading || !prompt}
        >
          {loading ? 'Generating...' : 'Generate Animation'}
        </button>
        {error && <div className="error-message">{error}</div>}
        {streamingText && (
          <div className="code-preview">
            <pre>{streamingText}</pre>
          </div>
        )}
      </div>
      <div 
        ref={animationContainerRef} 
        className="animation-container"
      />
    </div>
  )
}

export default App
