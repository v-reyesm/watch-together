# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application called "watch-together" using React 19, TypeScript, and Tailwind CSS. The project follows the App Router pattern with modern Next.js conventions.

## Development Commands

- `npm run dev` - Start the development server (runs on http://localhost:3000)
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

## Architecture

### Framework & Dependencies
- **Next.js 15** with App Router architecture
- **React 19** with TypeScript support
- **Tailwind CSS 4** for styling
- **ESLint** with Next.js configuration for code quality

### Project Structure
- `src/app/` - App Router pages and layouts
  - `layout.tsx` - Root layout with Geist font configuration
  - `page.tsx` - Home page component
  - `globals.css` - Global Tailwind styles
- `public/` - Static assets (SVG icons)
- TypeScript configuration uses path mapping (`@/*` points to `./src/*`)

### Key Configuration
- Uses Geist Sans and Geist Mono fonts from Google Fonts
- ESLint extends `next/core-web-vitals` and `next/typescript`
- TypeScript configured with strict mode and Next.js plugin
- Tailwind CSS configured with PostCSS

## Development Notes

This is a fresh Next.js project bootstrapped with `create-next-app`, currently containing only the default landing page. The project is ready for building a "watch-together" application with a solid foundation of modern web technologies.