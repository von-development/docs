// Test the regex patterns for inline annotations
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

const testCases = [
    '# (1)! Define a tool for the agent to use. Tools can be defined as vanilla Python functions.',
    '// (2)! Provide a language model for the agent to use.',
    '/* (3)! Provide a list of tools for the model to use. */',
    '-- (4)! Provide a system prompt to the language model.',
    '<!-- (5)! This is an HTML comment annotation -->'
];

console.log('Testing annotation patterns:\n');

testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase}`);
    
    let matched = false;
    ANNOTATION_PATTERNS.forEach((pattern, patternIndex) => {
        pattern.lastIndex = 0; // Reset regex state
        const match = pattern.exec(testCase);
        if (match) {
            console.log(`  ✅ Pattern ${patternIndex + 1} matched!`);
            console.log(`  Number: ${match[1]}`);
            console.log(`  Explanation: "${match[2]}"`);
            matched = true;
        }
    });
    
    if (!matched) {
        console.log('  ❌ No patterns matched');
    }
    console.log('');
});