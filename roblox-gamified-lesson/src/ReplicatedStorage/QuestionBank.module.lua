local QuestionBank = {}

-- You can add more lessons and questions here
QuestionBank.Lessons = {
    {
        id = "math_basics",
        title = "Math Basics",
        description = "Practice addition, subtraction, multiplication.",
        questions = {
            { id = "q1", text = "What is 7 + 5?", answers = {"10", "11", "12", "13"}, correctIndex = 3, explanation = "7 + 5 = 12" },
            { id = "q2", text = "What is 9 - 6?", answers = {"1", "2", "3", "4"}, correctIndex = 3, explanation = "9 - 6 = 3" },
            { id = "q3", text = "What is 4 x 3?", answers = {"7", "11", "12", "14"}, correctIndex = 3, explanation = "4 * 3 = 12" },
        }
    },
    {
        id = "science_intro",
        title = "Science Intro",
        description = "Simple science facts.",
        questions = {
            { id = "q1", text = "Water freezes at what Celsius temp?", answers = {"0°", "32°", "100°", "-10°"}, correctIndex = 1, explanation = "0°C is the freezing point." },
            { id = "q2", text = "Earth is the ___ planet from the Sun.", answers = {"1st", "2nd", "3rd", "4th"}, correctIndex = 3, explanation = "Mercury, Venus, Earth (third)." },
            { id = "q3", text = "Which gas do plants absorb?", answers = {"Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"}, correctIndex = 3, explanation = "Photosynthesis uses CO2." },
        }
    }
}

return QuestionBank