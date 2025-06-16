# Food Faves Tracker 🍽️

A React-based cross-platform application for tracking and sharing your favorite meals from restaurants. Available as a web app and native mobile app.

## Features

- 🔍 **Restaurant Search**: Search for restaurants using OpenStreetMap data
- 📍 **Location Support**: Find nearby restaurants using your current location
- ⭐ **Ratings & Reviews**: Rate meals and add detailed descriptions
- 🏷️ **Tags & Categories**: Organize meals with custom tags and meal types
- 📅 **Date Tracking**: Record when you enjoyed each meal
- 📝 **Notes**: Add detailed notes about dietary restrictions, occasions, etc.
- 📱 **Cross-Platform**: Works on web, iOS, and Android
- 📷 **Native Camera**: Take photos directly from the app (mobile)
- 🌍 **Native Geolocation**: Precise location detection (mobile)
- 🔗 **Social Sharing**: Share your favorite meals on social media

## Mobile App Development

This project supports native iOS and Android app development using Capacitor.

### Prerequisites for Mobile Development:

**For iOS development:**
- macOS with Xcode installed
- iOS Simulator or physical iOS device
- CocoaPods: `sudo gem install cocoapods`

**For Android development:**
- Android Studio installed
- Android SDK and emulator configured
- Java Development Kit (JDK) 8 or higher

### Mobile Development Commands:

```sh
# Install dependencies
npm install

# Build for mobile platforms
npm run build:capacitor

# Sync with native platforms
npm run cap:sync

# Open in iOS (requires macOS/Xcode)
npm run cap:ios

# Open in Android (requires Android Studio)
npm run cap:android

# Run with live reload on iOS
npm run cap:serve

# Run with live reload on Android  
npm run cap:serve:android
```

### Adding New Platforms:

If you need to add platforms to an existing project:

```sh
# Add iOS platform
npx cap add ios

# Add Android platform  
npx cap add android
```

### Native Features:

The app uses the following Capacitor plugins:
- **@capacitor/camera**: Native camera access for food photos
- **@capacitor/geolocation**: Precise location detection
- **@capacitor/device**: Platform detection and device info

### Platform-Specific Considerations:

- **Web**: Falls back to browser APIs (file input for camera, browser geolocation)
- **iOS**: Uses native camera and Core Location
- **Android**: Uses native camera and Android location services

## GitHub Pages Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions.

### Setup Instructions:

1. **Enable GitHub Pages:**
   - Go to your repository Settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "GitHub Actions"

2. **Configure Environment Variables:**
   - Go to repository Settings → Secrets and variables → Actions
   - Add the following repository secrets:
     - `VITE_SUPABASE_URL`: Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

3. **Deploy:**
   - Push to the `main` branch or manually trigger the workflow
   - The app will be available at: `https://yourusername.github.io/food-faves-tracker/`

### Manual Deployment:

You can also trigger deployment manually from the Actions tab in your GitHub repository.

## Project info

**URL**: https://lovable.dev/projects/d6512a53-2564-4e42-947b-dac8215719a5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d6512a53-2564-4e42-947b-dac8215719a5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d6512a53-2564-4e42-947b-dac8215719a5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
