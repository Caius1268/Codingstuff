# CS Servicing Simulator

An interactive, browser-based simulator for SHS ICT students to practice Computer System Servicing skills: PC assembly, troubleshooting, OS installation, networking basics, safety, and assessments. Runs as a simple static site with no build step.

## Quick start

- Open `index.html` in a modern browser; or
- Serve the folder and visit `http://localhost:8000`:
  - Python: `python3 -m http.server 8000 --directory /workspace`

Progress is stored in `localStorage` and can be exported via the Export button.

## Modules

- Virtual Lab: Drag and drop components to assemble a PC, with compatibility checks and scoring.
- Troubleshooting: Guided decision trees for common scenarios (no power, no display, overheating).
- OS Install: Step-through BIOS boot order, partitioning, user creation, and finish screens.
- Networking: T568B wire-order drag-rearrange and IP/subnet same-network validator.
- Safety & Tools: Tool selection, PPE/ESD checklists, and multimeter setting quiz.
- Assessments: Quick multi-question quiz with instant feedback.

## Teacher mode

Toggle in the header. Currently exposes a basic style hook for future teacher-only features.

## License

Content © you. Code licensed under CC BY 4.0 as a default. Replace with your preferred license if needed. 
