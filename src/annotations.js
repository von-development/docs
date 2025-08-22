/**
 * Self-injecting Code Annotations for Mintlify
 * 
 * This script automatically injects itself into the page and processes MkDocs-style annotations.
 * It works by creating both CSS and JavaScript functionality in a single file.
 */

(function() {
    'use strict';
    
    // Don't run if already loaded
    if (window.codeAnnotationsLoaded) return;
    window.codeAnnotationsLoaded = true;

    // Configuration
    const ANNOTATION_PATTERNS = {
        comment: /(?:\/\/|#|\/\*)\s*\((\d+)\)!\s*(?:\*\/)?/g,
        explanation: /^(\d+)\.\s+(.+)/
    };

    const ANNOTATION_CLASS = 'code-annotation';
    const TOOLTIP_CLASS = 'code-annotation-tooltip';
    const EXPLANATIONS_CLASS = 'code-annotations-explanations';

    // Inject CSS styles
    function injectStyles() {
        if (document.getElementById('code-annotations-styles')) return;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'code-annotations-styles';
        styleSheet.textContent = `
            .${ANNOTATION_CLASS} {
                position: relative;
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.3);
                border-radius: 4px;
                padding: 1px 4px;
                margin: 0 2px;
                cursor: pointer;
                font-weight: 600;
                color: #3b82f6;
                display: inline-block;
                transition: all 0.2s ease;
                line-height: 1.2;
            }

            .${ANNOTATION_CLASS}:hover {
                background: #2563eb;
                transform: translateY(-1px) scale(1.05);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }

            .${TOOLTIP_CLASS} {
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: #1f2937;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: normal;
                line-height: 1.4;
                white-space: normal;
                max-width: 300px;
                z-index: 1000;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.2s ease, visibility 0.2s ease, transform 0.2s ease;
                margin-bottom: 8px;
                pointer-events: none;
            }

            .${TOOLTIP_CLASS}::after {
                content: '';
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                border: 6px solid transparent;
                border-top-color: #1f2937;
            }

            .${ANNOTATION_CLASS}:hover .${TOOLTIP_CLASS} {
                opacity: 1;
                visibility: visible;
                transform: translateX(-50%) translateY(-2px);
            }

            .${EXPLANATIONS_CLASS} {
                display: none !important;
            }

            @media (max-width: 768px) {
                .${TOOLTIP_CLASS} {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    max-width: 80vw;
                    z-index: 10000;
                    margin-bottom: 0;
                }
                
                .${ANNOTATION_CLASS}:hover .${TOOLTIP_CLASS} {
                    transform: translate(-50%, -50%);
                }
                
                .${TOOLTIP_CLASS}::after {
                    display: none;
                }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // Extract explanations from text following code blocks
    function extractExplanations(container) {
        const explanations = new Map();
        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            const text = node.textContent.trim();
            const lines = text.split('\n');
            
            for (const line of lines) {
                const match = line.match(ANNOTATION_PATTERNS.explanation);
                if (match) {
                    const number = parseInt(match[1]);
                    const explanation = match[2].trim();
                    explanations.set(number, explanation);
                }
            }
        }

        return explanations;
    }

    // Process code blocks and add annotations
    function processCodeBlock(codeBlock, explanations) {
        const codeText = codeBlock.textContent;
        let annotatedHtml = '';
        let lastIndex = 0;
        
        // Find all annotation patterns in the code
        const matches = Array.from(codeText.matchAll(ANNOTATION_PATTERNS.comment));
        
        for (const match of matches) {
            const fullMatch = match[0];
            const number = parseInt(match[1]);
            const explanation = explanations.get(number);
            
            if (!explanation) continue;

            // Add text before the annotation
            annotatedHtml += escapeHtml(codeText.slice(lastIndex, match.index));
            
            // Create annotation element (display just the number)
            const annotationHtml = `<span class="${ANNOTATION_CLASS}" data-annotation="${number}">
                ${number}
                <div class="${TOOLTIP_CLASS}">${escapeHtml(explanation)}</div>
            </span>`;
            
            annotatedHtml += annotationHtml;
            lastIndex = match.index + fullMatch.length;
        }
        
        // Add remaining text
        annotatedHtml += escapeHtml(codeText.slice(lastIndex));
        
        if (matches.length > 0) {
            codeBlock.innerHTML = annotatedHtml;
            console.log('Code Annotations: Processed', matches.length, 'annotations in code block');
        }
    }

    // Hide explanation lists that have been converted to annotations
    function hideExplanationLists(container, usedNumbers) {
        const allElements = container.querySelectorAll('*');
        
        for (const element of allElements) {
            if (element.tagName === 'OL' || element.tagName === 'UL') {
                const listItems = element.querySelectorAll('li');
                let hasAnnotations = false;
                
                for (const li of listItems) {
                    const text = li.textContent.trim();
                    const match = text.match(ANNOTATION_PATTERNS.explanation);
                    if (match && usedNumbers.has(parseInt(match[1]))) {
                        hasAnnotations = true;
                        break;
                    }
                }
                
                if (hasAnnotations) {
                    element.classList.add(EXPLANATIONS_CLASS);
                }
            }
        }
    }

    // Escape HTML characters
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Process all code blocks in a container
    function processContainer(container) {
        const explanations = extractExplanations(container);
        if (explanations.size === 0) return;

        // Look for code blocks in various formats
        const codeBlocks = container.querySelectorAll([
            'pre code',
            '.highlight code', 
            '[class*="language-"] code',
            'code',
            '.shiki code'
        ].join(', '));
        
        const usedNumbers = new Set();

        for (const codeBlock of codeBlocks) {
            // Skip if this code block is inside a table or very small
            if (codeBlock.textContent.length < 10) continue;
            if (codeBlock.closest('table')) continue;
            
            processCodeBlock(codeBlock, explanations);
            
            // Track which numbers were used
            const matches = Array.from(codeBlock.textContent.matchAll(ANNOTATION_PATTERNS.comment));
            for (const match of matches) {
                const number = parseInt(match[1]);
                if (explanations.has(number)) {
                    usedNumbers.add(number);
                }
            }
        }

        if (usedNumbers.size > 0) {
            hideExplanationLists(container, usedNumbers);
            console.log('Code Annotations: Processed', usedNumbers.size, 'unique annotations');
        }
    }

    // Initialize the script
    function init() {
        console.log('Code Annotations: Initializing...');
        injectStyles();
        
        // Process existing content
        processContainer(document.body);
        
        // Watch for dynamically added content
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        processContainer(node);
                    }
                }
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('Code Annotations: Initialized successfully');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();