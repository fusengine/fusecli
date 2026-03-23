# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2026-03-23

### Changed

- Restructure to Turborepo monorepo (packages/cli + apps/web)
- Update README badges and repo URL

## [1.0.1] - 2026-03-23

### Maintenance

- Add Apache 2.0 license and NOTICE with Fusengine attribution

## [1.0.0] - 2026-03-23

### Added

- OpenAPI 3.x spec parser with full schema resolution
- CLI generator producing standalone TypeScript CLIs
- Interactive prompts for required/optional parameters
- Support for path, query, header, and body parameters
- Modular architecture: parser, IR, generators, templates
- Handlebars templates for CLI output
- Comprehensive test suite with fixtures
- TypeScript strict mode throughout
