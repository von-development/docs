# Code Annotations for Mintlify

This implementation adds support for MkDocs-style code annotations to Mintlify documentation. It allows you to add interactive, numbered annotations to code blocks with explanatory tooltips.

## How It Works

The system looks for numbered comment markers in code blocks (e.g., `# (1)!`, `// (2)!`) and pairs them with numbered explanations that follow the code block. When users hover over the annotations, they see a tooltip with the explanation.

## Files Added

- `src/code-annotations.js` - Main JavaScript functionality
- `src/code-annotations.css` - Styling for annotations and tooltips
- `src/test-annotations.mdx` - Test page demonstrating functionality

## Files Modified

- `src/docs.json` - Added the script and CSS to the Mintlify configuration

## Usage

### 1. In Code Blocks

Add numbered comment markers in your code:

```python
def my_function():  # (1)!
    result = process_data()  # (2)!
    return result  # (3)!
```

### 2. Add Explanations

After the code block, add numbered explanations:

```
1. This function demonstrates the main functionality of our system.
2. Process the input data using our custom processing logic.
3. Return the processed result to the caller.
```

### 3. Supported Comment Styles

The system supports multiple comment syntax patterns:

- Python/Bash: `# (1)!`
- JavaScript/C++: `// (1)!`
- CSS/Multi-line: `/* (1)! */`

### 4. Complete Example

````markdown
```python
import requests

def fetch_data(url):  # (1)!
    response = requests.get(url)  # (2)!
    if response.status_code == 200:  # (3)!
        return response.json()
    raise Exception("Failed to fetch")  # (4)!
```

1. Define a function that takes a URL parameter for data fetching.
2. Make an HTTP GET request to the specified URL endpoint.
3. Check if the response was successful (status code 200).
4. Raise an exception if the request failed for any reason.
````

## Features

### MkDocs-Style Icons
- Circular blue icons with white numbers, similar to MkDocs Material
- Smooth hover animations with scale and shadow effects
- Clean, modern appearance that integrates well with code blocks

### Interactive Tooltips
- Hover over any annotation icon to see the explanation
- Tooltips are positioned to avoid going off-screen
- Mobile-friendly with fixed positioning on small screens

### Automatic List Hiding
- Numbered explanation lists are automatically hidden when converted to annotations
- Prevents duplicate information display

### Theme Support
- Works with both light and dark themes
- Respects user's motion preferences
- High contrast mode support

### Performance
- Uses MutationObserver for dynamic content
- Efficient text processing with regex
- Minimal DOM manipulation

## Browser Support

- Modern browsers with ES6+ support
- Progressive enhancement (graceful degradation if JavaScript is disabled)
- Mobile responsive design
- Accessibility considerations

## Customization

### Styling
Modify `src/code-annotations.css` to customize:
- Annotation appearance (colors, borders, etc.)
- Tooltip styling and positioning
- Animation and transition effects

### JavaScript Behavior
Modify `src/code-annotations.js` to:
- Support additional comment patterns
- Change tooltip behavior
- Add new features like click-to-pin tooltips

## Testing

Use the test page at `src/test-annotations.mdx` to verify:
- Multiple annotation patterns work correctly
- Tooltips display properly
- Explanation lists are hidden
- Mobile responsiveness
- Theme compatibility

## Troubleshooting

### Annotations Not Showing
1. Check that the script is loaded in `docs.json`
2. Verify comment syntax matches supported patterns
3. Ensure explanations are numbered correctly

### Styling Issues
1. Check that CSS is loaded in `docs.json`
2. Verify no conflicting styles
3. Test in different themes/devices

### Performance Issues
1. Limit large amounts of annotated code on single pages
2. Consider lazy loading for heavy content
3. Monitor MutationObserver performance