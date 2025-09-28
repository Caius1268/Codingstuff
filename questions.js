const questionBank = {
  easy: [
    { q: "Phishing emails often ask for your ____?", a: [
      { text: "Birthday party invite", correct: false },
      { text: "Password or credentials", correct: true },
      { text: "Favorite food", correct: false },
      { text: "Pet's name", correct: false }
    ]},
    { q: "If an email asks you to click a link to secure your account immediately, you should:", a:[
      { text: "Click it right away", correct:false },
      { text: "Verify sender and open site manually", correct:true },
      { text: "Share it with classmates", correct:false },
      { text: "Ignore everything online", correct:false }
    ]},
    { q: "A suspicious email offers free prizes if you click a link. What do you do?", a:[
      { text: "Click it fast", correct:false },
      { text: "Delete or report it", correct:true },
      { text: "Forward it to friends", correct:false },
      { text: "Save the link for later", correct:false }
    ]},
    { q: "What should you check before clicking a link?", a:[
      { text: "Hover to preview the URL", correct:true },
      { text: "The font of the email", correct:false },
      { text: "If it has emojis", correct:false },
      { text: "Whether it looks fancy", correct:false }
    ]},
    { q: "Phishing emails often start with:", a:[
      { text: "Generic greetings like 'Dear Customer'", correct:true },
      { text: "Your full name always", correct:false },
      { text: "A handwritten note", correct:false },
      { text: "Cartoon images", correct:false }
    ]},
    { q: "Which password is the safest?", a:[
      { text: "123456", correct:false },
      { text: "P@ssw0rd!2023", correct:true },
      { text: "yourname123", correct:false },
      { text: "qwerty", correct:false }
    ]},
    { q: "If your teacher emails you for your login info, you should:", a:[
      { text: "Send it right away", correct:false },
      { text: "Verify in person first", correct:true },
      { text: "Reply with fake info", correct:false },
      { text: "Ignore all school emails", correct:false }
    ]},
    { q: "What’s a quick sign an email may be fake?", a:[
      { text: "Spelling mistakes", correct:true },
      { text: "It has your name", correct:false },
      { text: "It uses punctuation", correct:false },
      { text: "It was sent in the morning", correct:false }
    ]},
    { q: "Phishing often tries to create a feeling of:", a:[
      { text: "Urgency or fear", correct:true },
      { text: "Joy", correct:false },
      { text: "Calmness", correct:false },
      { text: "Happiness", correct:false }
    ]},
    { q: "The safest way to log in to your bank is:", a:[
      { text: "Click the email link", correct:false },
      { text: "Type the official site URL yourself", correct:true },
      { text: "Search on random websites", correct:false },
      { text: "Use a shared computer", correct:false }
    ]},
    { q: "What does 'phishing' try to steal?", a:[
      { text: "Your personal info", correct:true },
      { text: "Your homework", correct:false },
      { text: "Your shoes", correct:false },
      { text: "Your drawings", correct:false }
    ]},
    { q: "If an offer looks too good to be true, it is usually:", a:[
      { text: "Safe to try", correct:false },
      { text: "A scam or phishing attempt", correct:true },
      { text: "A gift", correct:false },
      { text: "A promotion", correct:false }
    ]},
    { q: "Where do phishing attacks usually appear?", a:[
      { text: "Emails and messages", correct:true },
      { text: "Printed books", correct:false },
      { text: "Your fridge", correct:false },
      { text: "School exams", correct:false }
    ]},
    { q: "Which is NOT safe to click?", a:[
      { text: "Link from unknown sender", correct:true },
      { text: "School portal link", correct:false },
      { text: "Bank website typed by you", correct:false },
      { text: "Trusted app shortcut", correct:false }
    ]},
    { q: "What should you do if unsure about a link?", a:[
      { text: "Open it immediately", correct:false },
      { text: "Ask an adult or teacher", correct:true },
      { text: "Ignore safety", correct:false },
      { text: "Click until it works", correct:false }
    ]},
    { q: "Phishing scams often use fake:", a:[
      { text: "Websites that look real", correct:true },
      { text: "Posters in town", correct:false },
      { text: "Textbooks", correct:false },
      { text: "Games on consoles", correct:false }
    ]},
    { q: "If a stranger asks for your password online, you should:", a:[
      { text: "Give it", correct:false },
      { text: "Never share it", correct:true },
      { text: "Only share with friends", correct:false },
      { text: "Post it online", correct:false }
    ]},
    { q: "A safe password should be:", a:[
      { text: "Long and complex", correct:true },
      { text: "Your pet’s name", correct:false },
      { text: "12345", correct:false },
      { text: "Just 'password'", correct:false }
    ]},
    { q: "Phishing is like:", a:[
      { text: "Fishing with bait, but online", correct:true },
      { text: "Cooking fish", correct:false },
      { text: "Going to the beach", correct:false },
      { text: "Playing video games", correct:false }
    ]},
    { q: "If you click a bad link, you should:", a:[
      { text: "Tell a parent/teacher right away", correct:true },
      { text: "Stay quiet", correct:false },
      { text: "Share link more", correct:false },
      { text: "Ignore it", correct:false }
    ]},
    { q: "Phishing can also happen in:", a:[
      { text: "Text messages (SMS)", correct:true },
      { text: "Physical notebooks", correct:false },
      { text: "Handwritten letters", correct:false },
      { text: "TV shows", correct:false }
    ]},
    { q: "Which file attachment might be risky?", a:[
      { text: "Unknown .exe file", correct:true },
      { text: "A photo from mom", correct:false },
      { text: "Homework .doc file from teacher", correct:false },
      { text: "School PDF notice", correct:false }
    ]},
    { q: "What should you do if unsure about an email?", a:[
      { text: "Check with the sender directly", correct:true },
      { text: "Click all links fast", correct:false },
      { text: "Forward it to friends", correct:false },
      { text: "Delete your account", correct:false }
    ]},
    { q: "Scammers sometimes pretend to be:", a:[
      { text: "Banks or schools", correct:true },
      { text: "Cartoon characters", correct:false },
      { text: "Animals", correct:false },
      { text: "Sports players", correct:false }
    ]},
    { q: "The padlock icon in browser means:", a:[
      { text: "Secure connection (https)", correct:true },
      { text: "The site is 100% safe always", correct:false },
      { text: "It’s a game", correct:false },
      { text: "It’s phishing", correct:false }
    ]},
    { q: "What should you do after receiving a phishing email?", a:[
      { text: "Report and delete it", correct:true },
      { text: "Save it", correct:false },
      { text: "Reply to scammer", correct:false },
      { text: "Forward to everyone", correct:false }
    ]},
    { q: "Safe place to enter your password is:", a:[
      { text: "Official websites you typed", correct:true },
      { text: "Any link in email", correct:false },
      { text: "Random popups", correct:false },
      { text: "Shared computers at cafés", correct:false }
    ]},
    { q: "Phishing emails may contain:", a:[
      { text: "Urgent warnings", correct:true },
      { text: "School cafeteria menu", correct:false },
      { text: "Cartoons", correct:false },
      { text: "Weather reports", correct:false }
    ]},
    { q: "If a stranger DMs you a suspicious link, you should:", a:[
      { text: "Click it", correct:false },
      { text: "Block and report", correct:true },
      { text: "Send password", correct:false },
      { text: "Ignore and save link", correct:false }
    ]},
    { q: "A phishing website might look:", a:[
      { text: "Almost identical to real one", correct:true },
      { text: "Like a hand-drawn sketch", correct:false },
      { text: "Completely blank", correct:false },
      { text: "Full of cartoons", correct:false }
    ]},
    { q: "What is the best action if you suspect phishing?", a:[
      { text: "Report it", correct:true },
      { text: "Save it", correct:false },
      { text: "Trust it", correct:false },
      { text: "Ignore always", correct:false }
    ]},
    { q: "Phishing scams sometimes offer:", a:[
      { text: "Free money or prizes", correct:true },
      { text: "School homework help", correct:false },
      { text: "Family photos", correct:false },
      { text: "Sports results", correct:false }
    ]},
    { q: "Phishing can target:", a:[
      { text: "Anyone online", correct:true },
      { text: "Only adults", correct:false },
      { text: "Only gamers", correct:false },
      { text: "Only teachers", correct:false }
    ]},
    { q: "The safest action with unknown attachments is:", a:[
      { text: "Don’t open them", correct:true },
      { text: "Open all fast", correct:false },
      { text: "Send to friends", correct:false },
      { text: "Ignore security", correct:false }
    ]},
    { q: "Which is an example of phishing?", a:[
      { text: "Fake email from your bank", correct:true },
      { text: "Homework email from teacher", correct:false },
      { text: "School newsletter", correct:false },
      { text: "Friend’s invite", correct:false }
    ]},
    { q: "When logging in, always check:", a:[
      { text: "The website URL", correct:true },
      { text: "The font style", correct:false },
      { text: "The time of day", correct:false },
      { text: "The site colors", correct:false }
    ]},
    { q: "If someone offers you free gift cards online, likely it's:", a:[
      { text: "Phishing scam", correct:true },
      { text: "Safe offer", correct:false },
      { text: "School project", correct:false },
      { text: "Homework reward", correct:false }
    ]},
    { q: "Phishing is dangerous because it steals:", a:[
      { text: "Personal information", correct:true },
      { text: "Books", correct:false },
      { text: "Snacks", correct:false },
      { text: "Sports gear", correct:false }
    ]},
    { q: "The safest way to confirm a message is real is:", a:[
      { text: "Contact the sender directly", correct:true },
      { text: "Click all links", correct:false },
      { text: "Believe first", correct:false },
      { text: "Forward widely", correct:false }
    ]},
    { q: "Scammers use fake urgency like:", a:[
      { text: "'Act now or lose access!'", correct:true },
      { text: "'Good morning!'", correct:false },
      { text: "'Have a nice day!'", correct:false },
      { text: "'Enjoy lunch!'", correct:false }
    ]},
    { q: "If unsure, the best person to ask is:", a:[
      { text: "A trusted adult/teacher", correct:true },
      { text: "A scammer", correct:false },
      { text: "Random strangers online", correct:false },
      { text: "Anyone", correct:false }
    ]},
    { q: "Which is safe to share online?", a:[
      { text: "None of your passwords", correct:true },
      { text: "Your PIN", correct:false },
      { text: "Credit card number", correct:false },
      { text: "Your locker code", correct:false }
    ]},
    { q: "Phishing can come from:", a:[
      { text: "Unknown emails or texts", correct:true },
      { text: "Only real banks", correct:false },
      { text: "Only schools", correct:false },
      { text: "Only family", correct:false }
    ]},
    { q: "A website URL with misspellings (like paypaI.com) is:", a:[
      { text: "Phishing site", correct:true },
      { text: "Official site", correct:false },
      { text: "Random fun site", correct:false },
      { text: "Safe to use", correct:false }
    ]},
    { q: "The best way to avoid phishing is:", a:[
      { text: "Think before you click", correct:true },
      { text: "Click everything", correct:false },
      { text: "Ignore advice", correct:false },
      { text: "Share passwords", correct:false }
    ]},
    { q: "Phishing messages may pretend to be from:", a:[
      { text: "Banks or delivery companies", correct:true },
      { text: "Your pet", correct:false },
      { text: "Cartoons", correct:false },
      { text: "Movies", correct:false }
    ]},
    { q: "The safest action with suspicious popups is:", a:[
      { text: "Close without clicking", correct:true },
      { text: "Click to claim prize", correct:false },
      { text: "Save for later", correct:false },
      { text: "Ignore warnings", correct:false }
    ]}
  ],

  medium: [
    { q: "Which of these is a red flag in an email?", a:[
      { text: "Spelling and grammar mistakes", correct:true },
      { text: "Proper school email format", correct:false },
      { text: "Friendly greeting with your name", correct:false },
      { text: "Clear subject line", correct:false }
    ]},
    { q: "Why is clicking shortened links risky?", a:[
      { text: "They may hide the real URL", correct:true },
      { text: "They load slower", correct:false },
      { text: "They look messy", correct:false },
      { text: "They are only for Twitter", correct:false }
    ]},
    { q: "Which sender address is suspicious?", a:[
      { text: "support@micr0soft.com", correct:true },
      { text: "teacher@school.edu", correct:false },
      { text: "help@bank.com", correct:false },
      { text: "info@library.org", correct:false }
    ]},
    { q: "What is 'spear phishing'?", a:[
      { text: "Targeted phishing at specific people", correct:true },
      { text: "Fishing with spears", correct:false },
      { text: "Mass emails to everyone", correct:false },
      { text: "An antivirus program", correct:false }
    ]},
    { q: "Which link is safest?", a:[
      { text: "https://www.mybank.com", correct:true },
      { text: "http://mybank.freeoffer.ru", correct:false },
      { text: "http://paypal-login.biz", correct:false },
      { text: "http://secure-update.net", correct:false }
    ]},
    { q: "Why do scammers use urgency like 'Act Now'?", a:[
      { text: "To stop you from thinking carefully", correct:true },
      { text: "To be polite", correct:false },
      { text: "To give you time", correct:false },
      { text: "For decoration", correct:false }
    ]},
    { q: "If you get an email from 'principal.school@gmail.com' asking for logins:", a:[
      { text: "It’s suspicious — schools don’t use Gmail", correct:true },
      { text: "It’s safe", correct:false },
      { text: "Reply quickly", correct:false },
      { text: "Send more info", correct:false }
    ]},
    { q: "What’s the difference between phishing and spam?", a:[
      { text: "Phishing tries to steal info, spam is just ads", correct:true },
      { text: "Spam is safer", correct:false },
      { text: "Phishing is legal", correct:false },
      { text: "Spam always has viruses", correct:false }
    ]},
    { q: "Which of these may be a phishing call?", a:[
      { text: "A caller asking for your password", correct:true },
      { text: "Reminder from your teacher", correct:false },
      { text: "Call from your friend", correct:false },
      { text: "School office calling parents", correct:false }
    ]},
    { q: "What’s a common feature of fake websites?", a:[
      { text: "Slight misspellings in URL", correct:true },
      { text: "Clear domain name", correct:false },
      { text: "Valid SSL certificate", correct:false },
      { text: "Correct logos", correct:false }
    ]},
    { q: "Which attachment type is riskiest?", a:[
      { text: ".exe", correct:true },
      { text: ".jpg", correct:false },
      { text: ".pdf from school", correct:false },
      { text: ".txt", correct:false }
    ]},
    { q: "If an email asks for your bank PIN:", a:[
      { text: "It’s phishing — banks never ask this", correct:true },
      { text: "It’s safe if from Gmail", correct:false },
      { text: "Reply later", correct:false },
      { text: "Save for later", correct:false }
    ]},
    { q: "Why is HTTPS important?", a:[
      { text: "It encrypts your connection", correct:true },
      { text: "It loads faster", correct:false },
      { text: "It makes site prettier", correct:false },
      { text: "It’s just for banks", correct:false }
    ]},
    { q: "What’s a common sign of phishing SMS?", a:[
      { text: "Links to unknown sites", correct:true },
      { text: "Short messages", correct:false },
      { text: "Friendly tone", correct:false },
      { text: "Simple language", correct:false }
    ]},
    { q: "What is 'smishing'?", a:[
      { text: "Phishing through SMS", correct:true },
      { text: "Fishing with small nets", correct:false },
      { text: "Spam emails", correct:false },
      { text: "Safe texting", correct:false }
    ]},
    { q: "Why should you hover links in emails?", a:[
      { text: "To preview the real destination", correct:true },
      { text: "To make them glow", correct:false },
      { text: "To copy link", correct:false },
      { text: "To check colors", correct:false }
    ]},
    { q: "A teacher asks for homework via Google Classroom. Is it phishing?", a:[
      { text: "No, it’s the right platform", correct:true },
      { text: "Yes, all requests are phishing", correct:false },
      { text: "Maybe, ignore teacher", correct:false },
      { text: "Always phishing", correct:false }
    ]},
    { q: "What’s a safe practice when receiving links?", a:[
      { text: "Type site manually instead of clicking", correct:true },
      { text: "Click everything", correct:false },
      { text: "Trust unknown senders", correct:false },
      { text: "Save all links", correct:false }
    ]},
    { q: "Which is safer to use for logging in?", a:[
      { text: "Two-Factor Authentication (2FA)", correct:true },
      { text: "Only password", correct:false },
      { text: "No login at all", correct:false },
      { text: "Sharing logins", correct:false }
    ]},
    { q: "A fake email might ask you to:", a:[
      { text: "Update info by clicking a link", correct:true },
      { text: "Do homework", correct:false },
      { text: "Join class", correct:false },
      { text: "Check grades in portal", correct:false }
    ]},
    { q: "Phishing emails sometimes pretend to be from:", a:[
      { text: "Banks or delivery companies", correct:true },
      { text: "Your best friend", correct:false },
      { text: "Cartoon networks", correct:false },
      { text: "Game developers only", correct:false }
    ]},
    { q: "Why are free Wi-Fi hotspots risky?", a:[
      { text: "Hackers can steal your info", correct:true },
      { text: "Wi-Fi is slow", correct:false },
      { text: "They cost money", correct:false },
      { text: "They block websites", correct:false }
    ]},
    { q: "If you get a job offer email with poor grammar:", a:[
      { text: "It’s likely phishing", correct:true },
      { text: "It’s always real", correct:false },
      { text: "Reply anyway", correct:false },
      { text: "Save it", correct:false }
    ]},
    { q: "What’s the safest way to download apps?", a:[
      { text: "Official app stores", correct:true },
      { text: "Random links in emails", correct:false },
      { text: "Pop-up ads", correct:false },
      { text: "From strangers", correct:false }
    ]},
    { q: "What is 'vishing'?", a:[
      { text: "Voice phishing via phone calls", correct:true },
      { text: "Fishing on vacation", correct:false },
      { text: "Spam letters", correct:false },
      { text: "Email newsletters", correct:false }
    ]},
    { q: "Why do scammers impersonate banks?", a:[
      { text: "To gain trust and steal data", correct:true },
      { text: "To offer good service", correct:false },
      { text: "To give free loans", correct:false },
      { text: "To help students", correct:false }
    ]},
    { q: "Which one is safer?", a:[
      { text: "Never sharing passwords", correct:true },
      { text: "Writing password on desk", correct:false },
      { text: "Sharing with classmates", correct:false },
      { text: "Posting on Facebook", correct:false }
    ]},
    { q: "What’s a sign of spear phishing?", a:[
      { text: "It uses your personal info", correct:true },
      { text: "It’s sent to thousands randomly", correct:false },
      { text: "It has funny memes", correct:false },
      { text: "It comes by mail", correct:false }
    ]},
    { q: "Why should you log out on public computers?", a:[
      { text: "Others could steal your account", correct:true },
      { text: "It saves battery", correct:false },
      { text: "It makes PC faster", correct:false },
      { text: "It deletes viruses", correct:false }
    ]},
    { q: "Which subject line is phishing-like?", a:[
      { text: "Urgent: Verify your account now!", correct:true },
      { text: "School meeting on Friday", correct:false },
      { text: "Happy birthday!", correct:false },
      { text: "Math assignment reminder", correct:false }
    ]},
    { q: "What does a phishing site often lack?", a:[
      { text: "Proper security certificates", correct:true },
      { text: "A logo", correct:false },
      { text: "Images", correct:false },
      { text: "Colors", correct:false }
    ]},
    { q: "Why do scammers use fake invoices?", a:[
      { text: "To trick victims into paying", correct:true },
      { text: "To send gifts", correct:false },
      { text: "To teach math", correct:false },
      { text: "For fun", correct:false }
    ]},
    { q: "Which login is most dangerous?", a:[
      { text: "On unknown websites", correct:true },
      { text: "On school portal", correct:false },
      { text: "On official bank app", correct:false },
      { text: "On Gmail official site", correct:false }
    ]},
    { q: "If a link says 'paypal.com.verify.ru', it is:", a:[
      { text: "Phishing site", correct:true },
      { text: "Safe site", correct:false },
      { text: "Short link", correct:false },
      { text: "Fun page", correct:false }
    ]},
    { q: "Why is clicking pop-up ads risky?", a:[
      { text: "They may install malware", correct:true },
      { text: "They are colorful", correct:false },
      { text: "They block videos", correct:false },
      { text: "They waste time", correct:false }
    ]},
    { q: "Why should you not reuse passwords?", a:[
      { text: "If leaked, all accounts are at risk", correct:true },
      { text: "It makes login harder", correct:false },
      { text: "It’s slower", correct:false },
      { text: "It’s boring", correct:false }
    ]},
    { q: "Which email is more suspicious?", a:[
      { text: "support@bank.scam.com", correct:true },
      { text: "support@bank.com", correct:false },
      { text: "teacher@school.edu", correct:false },
      { text: "info@library.org", correct:false }
    ]},
    { q: "What’s the safest place to update passwords?", a:[
      { text: "Official website settings", correct:true },
      { text: "Pop-up link", correct:false },
      { text: "Random email", correct:false },
      { text: "Text message link", correct:false }
    ]},
    { q: "Why is public charging risky?", a:[
      { text: "Juice jacking can steal data", correct:true },
      { text: "It drains battery", correct:false },
      { text: "It costs money", correct:false },
      { text: "It overheats phone", correct:false }
    ]},
    { q: "Which site name looks fake?", a:[
      { text: "amaz0n.com", correct:true },
      { text: "amazon.com", correct:false },
      { text: "school.edu", correct:false },
      { text: "bank.org", correct:false }
    ]},
    { q: "Phishing is often reported to:", a:[
      { text: "Authorities or IT staff", correct:true },
      { text: "Friends only", correct:false },
      { text: "Scammers", correct:false },
      { text: "TV stations", correct:false }
    ]}
  ],

  hard: [
    { q: "What is the safest way to confirm a suspicious email’s legitimacy?", a:[
      { text: "Inspect full email headers", correct:true },
      { text: "Trust the display name only", correct:false },
      { text: "Forward it to friends", correct:false },
      { text: "Click reply and ask", correct:false }
    ]},
    { q: "Which DNS trick do phishing domains often use?", a:[
      { text: "Typosquatting (slight misspellings)", correct:true },
      { text: "Government-verified domains", correct:false },
      { text: "Short URLs only", correct:false },
      { text: "Adding emojis", correct:false }
    ]},
    { q: "A secure-looking site with HTTPS can still be phishing because:", a:[
      { text: "Anyone can get SSL certificates", correct:true },
      { text: "HTTPS guarantees safety", correct:false },
      { text: "Scammers can’t use HTTPS", correct:false },
      { text: "Lock icon means trusted", correct:false }
    ]},
    { q: "What’s a 'watering hole' attack?", a:[
      { text: "Compromising a site your group often visits", correct:true },
      { text: "Fishing in shallow waters", correct:false },
      { text: "Sending fake invoices", correct:false },
      { text: "Phishing only by SMS", correct:false }
    ]},
    { q: "How can you spot a forged email header?", a:[
      { text: "Mismatch between 'From' and 'Return-Path'", correct:true },
      { text: "Contains subject text", correct:false },
      { text: "Is always long", correct:false },
      { text: "Has attachments", correct:false }
    ]},
    { q: "An attachment ending with '.scr' is likely:", a:[
      { text: "Malicious screensaver file", correct:true },
      { text: "Safe document", correct:false },
      { text: "Compressed backup", correct:false },
      { text: "Audio recording", correct:false }
    ]},
    { q: "Why are QR codes used in phishing (quishing)?", a:[
      { text: "They bypass link previews", correct:true },
      { text: "They are only used for coupons", correct:false },
      { text: "They can’t be scanned on phones", correct:false },
      { text: "They are always safe", correct:false }
    ]},
    { q: "Which login prompt is most suspicious?", a:[
      { text: "A pop-up inside an unrelated website", correct:true },
      { text: "School portal login page", correct:false },
      { text: "Google official login", correct:false },
      { text: "Bank’s official app", correct:false }
    ]},
    { q: "What’s a common trick in phishing invoices?", a:[
      { text: "Changing bank account numbers", correct:true },
      { text: "Spelling everything correctly", correct:false },
      { text: "Including official logos only", correct:false },
      { text: "Sending via postal mail", correct:false }
    ]},
    { q: "In business email compromise (BEC), attackers often:", a:[
      { text: "Impersonate CEOs or managers", correct:true },
      { text: "Send random memes", correct:false },
      { text: "Always include malware", correct:false },
      { text: "Avoid email altogether", correct:false }
    ]},
    { q: "What’s 'credential harvesting'?", a:[
      { text: "Stealing usernames and passwords", correct:true },
      { text: "Collecting fishing licenses", correct:false },
      { text: "Tracking ads", correct:false },
      { text: "Encrypting emails", correct:false }
    ]},
    { q: "What’s a homoglyph attack?", a:[
      { text: "Using look-alike letters in domains", correct:true },
      { text: "Phishing only via phone", correct:false },
      { text: "Watermarking emails", correct:false },
      { text: "Deleting headers", correct:false }
    ]},
    { q: "Why are macros in Office files dangerous?", a:[
      { text: "They can run malicious code", correct:true },
      { text: "They improve formatting", correct:false },
      { text: "They speed up Excel", correct:false },
      { text: "They make files smaller", correct:false }
    ]},
    { q: "Which header line shows real sending server?", a:[
      { text: "'Received:' line", correct:true },
      { text: "'Subject:' line", correct:false },
      { text: "'CC:' line", correct:false },
      { text: "'Date:' line", correct:false }
    ]},
    { q: "Why do phishing emails often avoid using your full name?", a:[
      { text: "They don’t know it", correct:true },
      { text: "It’s polite", correct:false },
      { text: "They want to be casual", correct:false },
      { text: "It saves space", correct:false }
    ]},
    { q: "Phishers sometimes use CAPTCHA pages to:", a:[
      { text: "Make fake sites look real", correct:true },
      { text: "Protect your login", correct:false },
      { text: "Prevent you from logging in", correct:false },
      { text: "Test your vision", correct:false }
    ]},
    { q: "What’s 'clone phishing'?", a:[
      { text: "Copying a real email but changing links", correct:true },
      { text: "Sending fishing images", correct:false },
      { text: "Phishing only via SMS", correct:false },
      { text: "Using cloned voices", correct:false }
    ]},
    { q: "Why are gift card scams common?", a:[
      { text: "Gift cards are hard to trace", correct:true },
      { text: "They are safe currency", correct:false },
      { text: "They last forever", correct:false },
      { text: "They are refundable", correct:false }
    ]},
    { q: "What’s the main danger of 'man-in-the-middle' phishing?", a:[
      { text: "Attackers intercept login data", correct:true },
      { text: "It only slows internet", correct:false },
      { text: "It improves security", correct:false },
      { text: "It changes colors", correct:false }
    ]},
    { q: "Which is a sign of DNS spoofing?", a:[
      { text: "Legit URL shows fake site", correct:true },
      { text: "Slow Wi-Fi", correct:false },
      { text: "Bright colors", correct:false },
      { text: "Too many ads", correct:false }
    ]},
    { q: "What does SPF/DKIM help with?", a:[
      { text: "Verifying sender authenticity", correct:true },
      { text: "Encrypting attachments", correct:false },
      { text: "Blocking pop-ups", correct:false },
      { text: "Shortening URLs", correct:false }
    ]},
    { q: "Why are free antivirus trials risky in phishing emails?", a:[
      { text: "They may hide malware downloads", correct:true },
      { text: "They never expire", correct:false },
      { text: "They are too helpful", correct:false },
      { text: "They only come on CDs", correct:false }
    ]},
    { q: "Why do phishers add random numbers in domains?", a:[
      { text: "To bypass spam filters", correct:true },
      { text: "For decoration", correct:false },
      { text: "To speed up loading", correct:false },
      { text: "To look shorter", correct:false }
    ]},
    { q: "Which payment request is suspicious?", a:[
      { text: "Untraceable cryptocurrency demand", correct:true },
      { text: "Invoice from IT department", correct:false },
      { text: "Tuition payment via portal", correct:false },
      { text: "School canteen card", correct:false }
    ]},
    { q: "What is 'evil twin' Wi-Fi?", a:[
      { text: "Fake hotspot mimicking real one", correct:true },
      { text: "Two routers at home", correct:false },
      { text: "Stronger signal Wi-Fi", correct:false },
      { text: "VPN service", correct:false }
    ]},
    { q: "Why are .zip attachments dangerous?", a:[
      { text: "They can hide malware files", correct:true },
      { text: "They load slowly", correct:false },
      { text: "They waste space", correct:false },
      { text: "They are too common", correct:false }
    ]},
    { q: "What’s the purpose of 'pharming'?", a:[
      { text: "Redirecting traffic to fake sites", correct:true },
      { text: "Farming data centers", correct:false },
      { text: "Selling farm goods", correct:false },
      { text: "Encrypting messages", correct:false }
    ]},
    { q: "Which social engineering tactic is most used in phishing?", a:[
      { text: "Urgency and fear", correct:true },
      { text: "Politeness", correct:false },
      { text: "Giving free gifts", correct:false },
      { text: "Formal greetings", correct:false }
    ]},
    { q: "Why is auto-forwarding rules phishing risk?", a:[
      { text: "They secretly send your emails to attackers", correct:true },
      { text: "They make inbox messy", correct:false },
      { text: "They delete old emails", correct:false },
      { text: "They use storage", correct:false }
    ]},
    { q: "What is the goal of 'BEC' scams?", a:[
      { text: "Trick employees into sending money/data", correct:true },
      { text: "Promote free emails", correct:false },
      { text: "Sell domains", correct:false },
      { text: "Encrypt hard drives", correct:false }
    ]},
    { q: "Which URL encoding trick hides phishing sites?", a:[
      { text: "Using %20 and symbols in links", correct:true },
      { text: "Using www.", correct:false },
      { text: "Using .com", correct:false },
      { text: "Using uppercase letters", correct:false }
    ]},
    { q: "What’s 'CEO fraud'?", a:[
      { text: "Impersonating executives to order payments", correct:true },
      { text: "Fake LinkedIn profiles", correct:false },
      { text: "Selling fake degrees", correct:false },
      { text: "Hiring scams", correct:false }
    ]},
    { q: "Why should you check DKIM signatures?", a:[
      { text: "They prove email hasn’t been altered", correct:true },
      { text: "They block viruses", correct:false },
      { text: "They encrypt the message", correct:false },
      { text: "They make headers shorter", correct:false }
    ]},
    { q: "Which phishing trick uses urgency and fake fines?", a:[
      { text: "Government impersonation scam", correct:true },
      { text: "Birthday greeting", correct:false },
      { text: "Newsletter", correct:false },
      { text: "Survey form", correct:false }
    ]},
    { q: "What’s 'tabnabbing'?", a:[
      { text: "Changing background tab to fake login", correct:true },
      { text: "Fishing at night", correct:false },
      { text: "Editing browser tabs", correct:false },
      { text: "Refreshing too fast", correct:false }
    ]},
    { q: "Why is clipboard hijacking dangerous?", a:[
      { text: "It replaces copied crypto addresses", correct:true },
      { text: "It clears text", correct:false },
      { text: "It slows PC", correct:false },
      { text: "It deletes passwords", correct:false }
    ]},
    { q: "Which is a phishing tactic on social media?", a:[
      { text: "Fake giveaway links", correct:true },
      { text: "Posting memes", correct:false },
      { text: "Sharing real news", correct:false },
      { text: "Birthday wishes", correct:false }
    ]},
    { q: "Why are phishing kits dangerous?", a:[
      { text: "They make phishing easy for criminals", correct:true },
      { text: "They protect victims", correct:false },
      { text: "They are educational only", correct:false },
      { text: "They stop spam", correct:false }
    ]},
    { q: "What’s 'man-in-the-browser' phishing?", a:[
      { text: "Malware altering transactions", correct:true },
      { text: "Faster browsing", correct:false },
      { text: "Private browsing", correct:false },
      { text: "Deleting cookies", correct:false }
    ]},
    { q: "Why do attackers use fake job offers?", a:[
      { text: "To steal resumes and data", correct:true },
      { text: "To hire people", correct:false },
      { text: "To give scholarships", correct:false },
      { text: "To help students", correct:false }
    ]},
    { q: "Which is more reliable to detect phishing?", a:[
      { text: "Full domain check", correct:true },
      { text: "Email design", correct:false },
      { text: "Fancy logos", correct:false },
      { text: "Sender name", correct:false }
    ]},
    { q: "Why do scammers use urgency + rewards together?", a:[
      { text: "To pressure and tempt victims", correct:true },
      { text: "To be nice", correct:false },
      { text: "To waste time", correct:false },
      { text: "To follow rules", correct:false }
    ]},
    { q: "What’s a 'dropper' file?", a:[
      { text: "Malware that downloads more malware", correct:true },
      { text: "File organizer", correct:false },
      { text: "Backup tool", correct:false },
      { text: "Music player", correct:false }
    ]},
    { q: "Why do advanced phishers use compromised accounts?", a:[
      { text: "They look more trustworthy", correct:true },
      { text: "They are faster", correct:false },
      { text: "They encrypt emails", correct:false },
      { text: "They remove spam", correct:false }
    ]}
  ]
};