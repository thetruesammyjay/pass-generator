# Password Generator

A secure and customizable password generator built to create strong, random passwords for enhanced security.

## Features

- 🔐 **Cryptographically Secure**: Uses secure random number generation
- ⚙️ **Highly Customizable**: Configure length, character sets, and complexity
- 🎯 **Multiple Character Sets**: Support for uppercase, lowercase, numbers, and special characters
- 📋 **Copy to Clipboard**: Easy one-click copying
- 🌐 **Cross-Platform**: Works on all modern browsers and operating systems
- 🎨 **Clean Interface**: Simple and intuitive user experience
- 🔒 **Privacy Focused**: No data is stored or transmitted

## Demo

[Live Demo](https://pass-generator-beryl.vercel.app/) 

## Installation

### Clone the Repository
```bash
git clone https://github.com/thetruesammyjay/pass-generator.git
cd pass-generator
```

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

### Basic Usage
1. Open the application in your browser
2. Select your desired password options:
   - Password length (8-128 characters)
   - Include uppercase letters
   - Include lowercase letters
   - Include numbers
   - Include special characters
3. Click "Generate Password"
4. Copy the generated password to your clipboard

### Advanced Options
- **Exclude Similar Characters**: Avoid confusing characters like 0, O, l, I
- **Exclude Ambiguous Characters**: Remove characters that might cause issues
- **Custom Character Sets**: Define your own character sets
- **Multiple Passwords**: Generate multiple passwords at once

## Configuration

You can customize the password generation by modifying the configuration options:

```javascript
const config = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeSimilar: false,
  excludeAmbiguous: false
};
```

## API Reference

### `generatePassword(options)`

Generates a password based on the provided options.

**Parameters:**
- `options` (Object): Configuration object
  - `length` (Number): Password length (default: 16)
  - `uppercase` (Boolean): Include uppercase letters (default: true)
  - `lowercase` (Boolean): Include lowercase letters (default: true)
  - `numbers` (Boolean): Include numbers (default: true)
  - `symbols` (Boolean): Include special characters (default: true)

**Returns:**
- `String`: Generated password

**Example:**
```javascript
const password = generatePassword({
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: false
});
```

## Security Features

- Uses `crypto.getRandomValues()` for cryptographically secure random generation
- No password storage or logging
- Client-side generation only
- Entropy calculation for password strength assessment

## Browser Support

- Chrome 11+
- Firefox 21+
- Safari 6.1+
- Edge 12+
- Opera 15+

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- Use ESLint for JavaScript linting
- Follow Prettier formatting rules
- Write meaningful commit messages
- Add tests for new features

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Deployment

### GitHub Pages
```bash
npm run build
npm run deploy
```

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider

## Changelog

### v1.0.0 (Latest)
- Initial release
- Basic password generation
- Customizable options
- Copy to clipboard functionality

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to the crypto community for security best practices
- Inspired by various password security guidelines
- Built with modern web technologies

## Support

If you encounter any issues or have questions:
- Open an issue on [GitHub](https://github.com/thetruesammyjay/pass-generator/issues)
- Contact: [sammyjayisthename@gmail.com]

## Roadmap

- [ ] Password strength meter
- [ ] Export/import functionality
- [ ] Dark mode support
- [ ] Mobile app version
- [ ] Browser extension
- [ ] Bulk password generation

---

**⚠️ Security Note**: Always use unique, strong passwords for each of your accounts. This tool generates cryptographically secure passwords, but remember to store them safely using a reputable password manager.
