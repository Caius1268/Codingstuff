local QuestionBank = require(game:GetService("ReplicatedStorage"):WaitForChild("QuestionBank"))

local LessonManager = {}
LessonManager.__index = LessonManager

export type PlayerLessonProgress = {
    lessonId: string,
    currentIndex: number,
    correctCount: number,
    total: number,
    startedAt: number,
}

function LessonManager.getLessons()
    local public = {}
    for _, lesson in ipairs(QuestionBank.Lessons) do
        table.insert(public, {
            id = lesson.id,
            title = lesson.title,
            description = lesson.description,
            total = #lesson.questions,
        })
    end
    return public
end

function LessonManager.getQuestion(lessonId: string, index: number)
    for _, lesson in ipairs(QuestionBank.Lessons) do
        if lesson.id == lessonId then
            local q = lesson.questions[index]
            if q then
                return {
                    id = q.id,
                    text = q.text,
                    answers = q.answers,
                    index = index,
                    total = #lesson.questions,
                }
            end
        end
    end
    return nil
end

function LessonManager.checkAnswer(lessonId: string, index: number, answerIndex: number)
    for _, lesson in ipairs(QuestionBank.Lessons) do
        if lesson.id == lessonId then
            local q = lesson.questions[index]
            if q then
                local isCorrect = (answerIndex == q.correctIndex)
                return isCorrect, q.explanation or ""
            end
        end
    end
    return false, "Invalid question"
end

return LessonManager