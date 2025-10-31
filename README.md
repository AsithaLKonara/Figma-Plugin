# 📐 Figma Spec Extractor

A powerful Figma plugin that extracts design specifications from selected components and automatically sends them to your Next.js API for code generation and documentation.

![Status](https://img.shields.io/badge/status-working%20perfectly-success)
![Figma Plugin](https://img.shields.io/badge/Figma-Plugin-blue)
![Next.js](https://img.shields.io/badge/Next.js-API-black)

---

## 🎯 Overview

**Figma Spec Extractor** is a comprehensive solution for extracting design specifications from Figma components. It supports:

- ✅ **Complete Spec Extraction** - Dimensions, colors, typography, layout, effects
- ✅ **Multiple Formats** - JSON (structured) and text (legacy)
- ✅ **API Integration** - Send specs directly to your Next.js API
- ✅ **Recursive Processing** - Extracts all child nodes and maintains hierarchy
- ✅ **10+ Node Types** - Frames, Components, Text, Shapes, and more

---

## 📁 Project Structure

```
figma_Plugin/
├── figma-plugin/
│   └── spec-extractor/
│       ├── manifest.json      # Plugin configuration
│       ├── code.js            # Main plugin logic (309 lines)
│       └── ui.html            # Plugin UI interface
│
├── figma-spec/
│   └── route.ts               # Next.js API route handler
│
├── PROJECT_OVERVIEW.md        # Detailed documentation
└── README.md                   # This file
```

---

## 🚀 Quick Start

### 1. Install the Plugin

1. Open Figma Desktop App
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Select `figma-plugin/spec-extractor/manifest.json`
4. The plugin will appear in your plugins menu

### 2. Set Up the API (Optional)

If you want to send specs to an API:

1. Add `figma-spec/route.ts` to your Next.js project at `/api/figma-spec`
2. Ensure your Next.js dev server is running on `http://localhost:3000`
3. Or configure a custom endpoint in the plugin UI

### 3. Use the Plugin

1. **Select a component** (Frame, Component, Group, etc.) in Figma
2. **Run the plugin**: Plugins → Development → Spec Extractor
3. **View extracted specs** in the plugin UI
4. **Optional actions:**
   - Click **Copy** to copy specs to clipboard
   - Click **Send** to POST specs to your API
   - Click **Refresh** to re-extract from current selection

---

## 📊 What Gets Extracted

### Layout & Dimensions
- Width & Height
- Auto-layout mode (Horizontal/Vertical)
- Item spacing (gaps)
- Padding (top/right/bottom/left)
- Layout alignment
- Sizing modes

### Visual Properties
- Fill colors (RGBA, hex)
- Gradients (linear, radial, angular, diamond)
- Image fills
- Stroke colors & weights
- Stroke alignment & caps
- Corner radii (uniform & mixed)
- Opacity & blend modes

### Typography
- Font family & style
- Font size & weight
- Line height
- Letter spacing
- Text case & decoration
- Text content

### Effects
- Drop shadow
- Inner shadow
- Layer blur
- Background blur

### Component Information
- Component ID & name
- Variant properties
- Instance relationships

---

## 💻 API Integration

### Next.js API Route

The `figma-spec/route.ts` file provides a POST endpoint that:

- Receives spec data: `{ name: string, content: string }`
- Sanitizes filenames for security
- Saves specs to `src/components/ui/{ComponentName}.txt`
- Returns success response with file path

### Example API Usage

```typescript
// POST /api/figma-spec
{
  "name": "Button Component",
  "content": "{ ... extracted JSON spec ... }"
}

// Response
{
  "ok": true,
  "file": "src/components/ui/Button-Component.txt"
}
```

### Custom Endpoint

You can configure a custom API endpoint in the plugin UI:
- Default: `http://localhost:3000/api/figma-spec`
- Custom: Enter any valid POST endpoint URL

---

## 📝 Output Formats

### JSON Format (Recommended)

Structured JSON with complete component hierarchy:

```json
{
  "id": "node-id",
  "name": "Component Name",
  "type": "FRAME",
  "width": 375,
  "height": 812,
  "layout": {
    "layoutMode": "VERTICAL",
    "itemSpacing": 16,
    "padding": { "left": 20, "right": 20, "top": 20, "bottom": 20 }
  },
  "fills": [
    {
      "type": "SOLID",
      "color": { "r": 1, "g": 1, "b": 1 },
      "opacity": 1
    }
  ],
  "typography": {
    "fontFamily": "Inter",
    "fontSize": 16,
    "lineHeightPx": 24
  },
  "children": [...]
}
```

### Text Format (Legacy)

Compact text representation:

```
ComponentName {
    {w 375 h 812 padding left 20 right 20 top 20 bottom 20 rows 3 gap 16}
        {w 335 h 48 fill #FFFFFF corner radius 8}
        {text w 335 h 24 Inter/16 line 24 semibold #000000}
        {"Button Text"}
    }
}
```

---

## 🎨 Supported Node Types

| Node Type | Supported |
|-----------|-----------|
| **FRAME** | ✅ Full support |
| **COMPONENT** | ✅ Full support |
| **INSTANCE** | ✅ Full support |
| **GROUP** | ✅ Full support |
| **TEXT** | ✅ Typography extraction |
| **RECTANGLE** | ✅ Shape properties |
| **ELLIPSE** | ✅ Shape properties |
| **POLYGON** | ✅ Shape properties |
| **STAR** | ✅ Shape properties |
| **VECTOR** | ✅ Path properties |
| **LINE** | ✅ Line properties |
| **COMPONENT_SET** | ✅ Variant sets |

---

## 🔧 Features

### Plugin Features
- **Real-time Extraction** - Instant spec extraction from selection
- **Recursive Processing** - Handles nested components and groups
- **Error Handling** - Graceful handling of invalid selections
- **Format Switching** - Toggle between JSON and text formats
- **Copy to Clipboard** - One-click copy for easy sharing
- **Custom Endpoints** - Configure your own API endpoint

### API Features
- **Secure File Saving** - Filename sanitization prevents path traversal
- **CORS Support** - Cross-origin requests enabled
- **Error Handling** - Comprehensive error responses
- **Auto Directory Creation** - Creates directories if needed

---

## 📖 Usage Examples

### Example 1: Extract Button Component

1. Select a button component in Figma
2. Run Spec Extractor plugin
3. View JSON spec with:
   - Dimensions
   - Colors (fill, stroke)
   - Typography
   - Corner radius
   - Padding

### Example 2: Extract Complex Layout

1. Select a frame with nested components
2. Run plugin
3. Get complete hierarchy:
   - Parent frame layout
   - Child component specs
   - Nested text layers
   - All visual properties

### Example 3: Send to API

1. Extract spec from component
2. Configure API endpoint
3. Click "Send"
4. Spec saved to `src/components/ui/` on server

---

## 🛠️ Development

### Plugin Development

To modify the plugin:

1. Edit `figma-plugin/spec-extractor/code.js`
2. Test in Figma Desktop App
3. Reload plugin to see changes

### API Development

To modify the API:

1. Edit `figma-spec/route.ts`
2. Deploy to your Next.js app
3. Update endpoint URL in plugin if needed

---

## 🔍 Technical Details

### Color Conversion
- **RGBA Format**: `rgba(255, 255, 255, 1.00)`
- **Hex Format**: `#FFFFFF`
- Handles opacity/alpha channels
- Clamps values to valid ranges

### Layout Extraction
- Auto-layout mode detection
- Gap spacing extraction
- Padding (all sides)
- Alignment properties

### Typography Extraction
- Font family & style
- Font size (px)
- Line height (px)
- Letter spacing
- Text case & decoration
- Text content

---

## 📚 Documentation

- **PROJECT_OVERVIEW.md** - Comprehensive technical documentation
- **README.md** - This file (quick start guide)
- **Code Comments** - Inline documentation in source files

---

## 🎯 Use Cases

### Design-to-Code
- Extract specs → Generate React/Vue components
- Auto-generate CSS/SCSS
- Create Tailwind configs

### Documentation
- Export design tokens
- Create component libraries
- Generate style guides

### Development
- Quick reference for dimensions
- Color palette extraction
- Typography specifications

### Automation
- CI/CD integration
- Design diff detection
- Automated testing

---

## 🔮 Future Enhancements

- [ ] Export to CSS/SCSS formats
- [ ] Batch processing (multiple components)
- [ ] Image export integration
- [ ] Component dependency mapping
- [ ] Design token extraction
- [ ] Style guide generation
- [ ] Real-time preview
- [ ] Version history

---

## 🐛 Troubleshooting

### Plugin doesn't extract specs
- Ensure you have a component/frame/group selected
- Check that selection is valid (not locked or hidden)

### API not receiving data
- Verify Next.js server is running
- Check endpoint URL in plugin UI
- Ensure CORS is configured correctly
- Check browser console for errors

### File not saving on server
- Verify directory permissions
- Check file path in API response
- Ensure `src/components/ui/` directory exists

---

## 📄 License

This project is available for use and modification.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

## 👤 Author

**Asitha Konara**

- GitHub: [@AsithaLKonara](https://github.com/AsithaLKonara)
- Repository: [Figma-Plugin](https://github.com/AsithaLKonara/Figma-Plugin)

---

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check `PROJECT_OVERVIEW.md` for detailed documentation

---

## ⭐ Features at a Glance

- ✅ **10+ Node Types** supported
- ✅ **JSON & Text** output formats
- ✅ **API Integration** built-in
- ✅ **Recursive Extraction** maintains hierarchy
- ✅ **Real-time Preview** in plugin UI
- ✅ **Copy to Clipboard** for easy sharing
- ✅ **Custom Endpoints** for flexibility
- ✅ **Error Handling** for reliability

---

**Status:** ✅ Working Perfectly  
**Last Updated:** October 31, 2025

