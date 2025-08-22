/**
 * Code Annotations for Mintlify
 * 
 * This script adds support for MkDocs-style code annotations in Mintlify.
 * It looks for numbered comment markers (e.g., # (1)!) in code blocks and
 * creates interactive annotations with explanatory text.
 */

(function() {
    'use strict';

    // Configuration
    const ANNOTATION_PATTERNS = {
        // Matches patterns like # (1)!, // (2)!, /* (3)! */, etc.
        comment: /(?:\/\/|#|\/\*)\s*\((\d+)\)!\s*(?:\*\/)?/g,
        // Matches numbered list items like "1. Explanation text"
        explanation: /^(\d+)\.\s+(.+)/
    };

    const ANNOTATION_CLASS = 'code-annotation';
    const TOOLTIP_CLASS = 'code-annotation-tooltip';
    const EXPLANATIONS_CLASS = 'code-annotations-explanations';


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
            
            // Create annotation element
            const annotationHtml = `<span class="${ANNOTATION_CLASS}" data-annotation="${number}">
                ${escapeHtml(fullMatch)}
                <div class="${TOOLTIP_CLASS}">${escapeHtml(explanation)}</div>
            </span>`;
            
            annotatedHtml += annotationHtml;
            lastIndex = match.index + fullMatch.length;
        }
        
        // Add remaining text
        annotatedHtml += escapeHtml(codeText.slice(lastIndex));
        
        if (matches.length > 0) {
            codeBlock.innerHTML = annotatedHtml;
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

        const codeBlocks = container.querySelectorAll('pre code, .highlight code, [class*="language-"] code');
        const usedNumbers = new Set();

        for (const codeBlock of codeBlocks) {
            const beforeCount = usedNumbers.size;
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
        }
    }

    // Initialize the script
    function init() {
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
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();