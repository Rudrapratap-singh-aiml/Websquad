# StayServe – Hotel Guest Service Request System
## Run locally
Best: install Python 3, run `python server.py` in this folder, open http://localhost:8000 (everything is saved into `data/*.json`).
Quick look: double-click `index.html` (data then lives in browser localStorage).
## Files
index.html (all pages) · css/style.css · js/app.js (logic) · js/captcha.js (separate CAPTCHA module) · js/config.js (departments & request categories – edit to add more)
data/guests.json, data/staff.json, data/requests.json – start empty; every guest, staff member and request is created from user input.
server.py – local server with the saving rules.
## Rules
- Guest: same email can never register twice (any mobile); same mobile with a new email is fine. Staff: unique email and employee ID.
- CAPTCHA (case-insensitive) on every login and sign-up. Unknown user at login is offered sign-up, then returns to login.
- Request flow: Pending -> In Progress (staff accepts) -> Completed (with note) -> guest rates 1-5. Guest may cancel while Pending.
- Staff only see their own department's requests, urgent first.
To reset: set the three JSON files back to `[]`.
