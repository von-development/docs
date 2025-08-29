// Test the code annotations with actual quickstart content
const fs = require('fs');

// Mock DOM elements for testing
class MockElement {
    constructor(innerHTML = '') {
        this.innerHTML = innerHTML;
        this.attributes = new Map();
        this.classList = {
            add: (className) => console.log(`Added class: ${className}`),
            remove: (className) => console.log(`Removed class: ${className}`),
            toggle: (className) => console.log(`Toggled class: ${className}`)
        };
    }
    
    setAttribute(name, value) {
        this.attributes.set(name, value);
        console.log(`Set attribute ${name}="${value}"`);
    }
    
    hasAttribute(name) {
        return this.attributes.has(name);
    }
    
    querySelectorAll() {
        return [];
    }
    
    addEventListener(event, handler) {
        console.log(`Added ${event} event listener`);
    }
}

// Sample quickstart content from the MDX file
const quickstartCode = `def get_weather(city: str) -> str:  # (1)! Define a tool for the agent to use. Tools can be defined as vanilla Python functions.
    """Get weather for a given city."""
    return f"It's always sunny in {city}!"

agent = create_react_agent( 
    model="anthropic:claude-3-7-sonnet-latest",  # (2)! Provide a language model for the agent to use. To learn more about configuring language models, check the models page.
    tools=[get_weather],  # (3)! Provide a list of tools for the model to use.
    prompt="You are a helpful assistant"  # (4)! Provide a system prompt (instructions) to the language model used by the agent.
)`;

// Test patterns from our implementation
const ANNOTATION_PATTERNS = [
    // Python, JavaScript, TypeScript comments: # (1)! explanation text
    /(?:\/\/|#)\s*\((\d+)\)!\s*([^\n\r]*)/g,
    // HTML comments: <!-- (1)! explanation text -->
    /<!--\s*\((\d+)\)!\s*([^-]*?)-->/g,
    // CSS comments: /* (1)! explanation text */
    /\/\*\s*\((\d+)\)!\s*([^*]*?)\*\//g,
    // SQL comments: -- (1)! explanation text
    /--\s*\((\d+)\)!\s*([^\n\r]*)/g
];

console.log('🧪 Testing quickstart content processing...\n');

let codeContent = quickstartCode;
let hasAnnotations = false;
const annotations = new Map();

// Process each annotation pattern
ANNOTATION_PATTERNS.forEach((pattern, patternIndex) => {
    const originalContent = codeContent;
    
    codeContent = codeContent.replace(pattern, (match, number, explanationText) => {
        hasAnnotations = true;
        console.log(`✨ Pattern ${patternIndex + 1} found annotation: ${match}`);
        console.log(`   📝 Number: ${number}, Explanation: "${explanationText}"`);
        
        // Clean up the explanation text
        const explanation = explanationText ? explanationText.trim() : `Annotation ${number}`;
        
        if (explanation && explanation !== `Annotation ${number}`) {
            annotations.set(number, explanation);
        }
        
        // Replace with HTML annotation marker (simulated)
        return `<ANNOTATION data-annotation="${number}">
            <MARKER>${number}</MARKER>
            <TOOLTIP>${explanation}</TOOLTIP>
        </ANNOTATION>`;
    });
    
    if (originalContent !== codeContent) {
        console.log(`   🔄 Content modified by pattern ${patternIndex + 1}`);
    }
});

console.log('\n📊 Processing Results:');
console.log(`   Annotations found: ${hasAnnotations}`);
console.log(`   Total annotations: ${annotations.size}`);
console.log(`   Annotations map:`, Object.fromEntries(annotations));

if (hasAnnotations) {
    console.log('\n🎉 SUCCESS: Annotations were processed correctly!');
    console.log('\n📝 Processed content preview:');
    console.log(codeContent.substring(0, 500) + '...');
} else {
    console.log('\n❌ FAILURE: No annotations were found or processed');
}