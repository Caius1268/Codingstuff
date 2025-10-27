local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local player = Players.LocalPlayer
local remotes = ReplicatedStorage:WaitForChild("Remotes")
local RequestLessons = remotes:WaitForChild("RequestLessons") :: RemoteFunction
local StartLesson = remotes:WaitForChild("StartLesson") :: RemoteFunction
local SubmitAnswer = remotes:WaitForChild("SubmitAnswer") :: RemoteFunction
local ClaimDaily = remotes:WaitForChild("ClaimDaily") :: RemoteFunction
local PurchaseItem = remotes:WaitForChild("PurchaseItem") :: RemoteFunction
local GetOwnedItems = remotes:WaitForChild("GetOwnedItems") :: RemoteFunction

local screenGui = Instance.new("ScreenGui")
screenGui.Name = "LessonUI"
screenGui.ResetOnSpawn = false
screenGui.IgnoreGuiInset = false
screenGui.Parent = player:WaitForChild("PlayerGui")

local function createButton(parent, text)
    local b = Instance.new("TextButton")
    b.Size = UDim2.new(1, 0, 0, 40)
    b.BackgroundColor3 = Color3.fromRGB(35, 40, 50)
    b.TextColor3 = Color3.new(1, 1, 1)
    b.Text = text
    b.Font = Enum.Font.GothamBold
    b.TextSize = 18
    b.Parent = parent
    return b
end

local function createLabel(parent, text, sizeY)
    local l = Instance.new("TextLabel")
    l.Size = UDim2.new(1, 0, 0, sizeY or 30)
    l.BackgroundTransparency = 1
    l.TextColor3 = Color3.new(1, 1, 1)
    l.Text = text
    l.Font = Enum.Font.Gotham
    l.TextSize = 18
    l.Parent = parent
    return l
end

local function createCard(parent)
    local f = Instance.new("Frame")
    f.Size = UDim2.new(0, 500, 0, 420)
    f.Position = UDim2.new(0.5, -250, 0.5, -210)
    f.BackgroundColor3 = Color3.fromRGB(20, 24, 35)
    f.BorderSizePixel = 0
    f.Parent = parent

    local uic = Instance.new("UICorner")
    uic.CornerRadius = UDim.new(0, 10)
    uic.Parent = f

    local padding = Instance.new("UIPadding")
    padding.PaddingTop = UDim.new(0, 16)
    padding.PaddingBottom = UDim.new(0, 16)
    padding.PaddingLeft = UDim.new(0, 16)
    padding.PaddingRight = UDim.new(0, 16)
    padding.Parent = f

    local list = Instance.new("UIListLayout")
    list.Padding = UDim.new(0, 10)
    list.FillDirection = Enum.FillDirection.Vertical
    list.SortOrder = Enum.SortOrder.LayoutOrder
    list.Parent = f

    return f
end

local hud = Instance.new("Frame")
hud.Size = UDim2.new(1, 0, 0, 50)
hud.BackgroundColor3 = Color3.fromRGB(16, 18, 24)
hud.Parent = screenGui

local hudCoins = createLabel(hud, "Coins: 0")
hudCoins.Size = UDim2.new(0, 200, 1, 0)
hudCoins.TextXAlignment = Enum.TextXAlignment.Left
hudCoins.Position = UDim2.new(0, 16, 0, 0)

local hudXP = createLabel(hud, "XP: 0")
hudXP.Size = UDim2.new(0, 200, 1, 0)
hudXP.TextXAlignment = Enum.TextXAlignment.Left
hudXP.Position = UDim2.new(0, 220, 0, 0)

local tabs = Instance.new("Frame")
tabs.Size = UDim2.new(0, 500, 0, 40)
tabs.Position = UDim2.new(0.5, -250, 0, 60)
tabs.BackgroundTransparency = 1
tabs.Parent = screenGui

local tabLesson = createButton(tabs, "Lessons")
tabLesson.Size = UDim2.new(0, 160, 1, 0)
tabLesson.Position = UDim2.new(0, 0, 0, 0)

local tabShop = createButton(tabs, "Shop")
tabShop.Size = UDim2.new(0, 160, 1, 0)
tabShop.Position = UDim2.new(0, 170, 0, 0)

local tabDaily = createButton(tabs, "Daily")
tabDaily.Size = UDim2.new(0, 160, 1, 0)
tabDaily.Position = UDim2.new(0, 340, 0, 0)

local view = createCard(screenGui)

local function clearView()
    for _, c in ipairs(view:GetChildren()) do
        if c:IsA("GuiObject") and not c:IsA("UIListLayout") and not c:IsA("UIPadding") and not c:IsA("UICorner") then
            c:Destroy()
        end
    end
end

-- HUD bind leaderstats
local function bindLeaderstats()
    local leaderstats = player:WaitForChild("leaderstats", 10)
    if not leaderstats then return end
    local coins = leaderstats:WaitForChild("Coins", 10)
    local xp = leaderstats:WaitForChild("XP", 10)
    if coins then coins:GetPropertyChangedSignal("Value"):Connect(function()
        hudCoins.Text = "Coins: " .. coins.Value
    end); hudCoins.Text = "Coins: " .. coins.Value end
    if xp then xp:GetPropertyChangedSignal("Value"):Connect(function()
        hudXP.Text = "XP: " .. xp.Value
    end); hudXP.Text = "XP: " .. xp.Value end
end
bindLeaderstats()

-- LESSON UI
local function showLessons()
    clearView()
    createLabel(view, "Pick a Lesson", 30)
    local lessons = RequestLessons:InvokeServer()
    for _, lesson in ipairs(lessons) do
        local btn = createButton(view, string.format("%s (%d Qs)\n%s", lesson.title, lesson.total, lesson.description))
        btn.AutoButtonColor = true
        btn.MouseButton1Click:Connect(function()
            local q = StartLesson:InvokeServer(lesson.id)
            if q and q.text then
                showQuestion(lesson.id, q)
            end
        end)
    end
end

function showQuestion(lessonId, question)
    clearView()
    createLabel(view, string.format("%s (%d/%d)", lessonId, question.index, question.total), 24)

    local ql = createLabel(view, question.text, 60)
    ql.TextWrapped = true

    for i, answer in ipairs(question.answers) do
        local btn = createButton(view, answer)
        btn.MouseButton1Click:Connect(function()
            btn.AutoButtonColor = false
            local result = SubmitAnswer:InvokeServer(i)
            if result and result.error then
                createLabel(view, result.error)
                return
            end
            local feedback = Instance.new("TextLabel")
            feedback.BackgroundTransparency = 1
            feedback.Size = UDim2.new(1, 0, 0, 50)
            feedback.Text = result.correct and "Correct!" or "Incorrect"
            feedback.Font = Enum.Font.GothamBlack
            feedback.TextSize = 22
            feedback.TextColor3 = result.correct and Color3.fromRGB(80, 220, 120) or Color3.fromRGB(240, 90, 90)
            feedback.Parent = view

            if result.explanation and result.explanation ~= "" then
                local expl = createLabel(view, result.explanation, 40)
                expl.TextWrapped = true
            end

            if result.finished then
                local summary = createLabel(view, string.format("Lesson complete! Correct: %d/%d", result.correctCount, question.total), 40)
                summary.TextWrapped = true
                local back = createButton(view, "Back to Lessons")
                back.MouseButton1Click:Connect(function()
                    showLessons()
                end)
            else
                task.wait(0.6)
                showQuestion(lessonId, result.nextQuestion)
            end
        end)
    end
end

-- SHOP UI
local function showShop()
    clearView()
    createLabel(view, "Shop", 30)

    local items = {
        { id = "trail_red", name = "Red Trail", price = 50 },
        { id = "trail_blue", name = "Blue Trail", price = 50 },
        { id = "speed_boost", name = "Speed Boost", price = 150 },
    }

    local owned = GetOwnedItems:InvokeServer()

    for _, item in ipairs(items) do
        local labelText = string.format("%s - %d coins", item.name, item.price)
        if owned[item.id] then labelText = labelText .. " (Owned)" end
        local btn = createButton(view, labelText)
        btn.AutoButtonColor = not owned[item.id]
        btn.TextTransparency = owned[item.id] and 0.3 or 0
        if not owned[item.id] then
            btn.MouseButton1Click:Connect(function()
                local res = PurchaseItem:InvokeServer(item.id)
                local msg = createLabel(view, res.message or "", 28)
                msg.TextColor3 = res.ok and Color3.fromRGB(80, 220, 120) or Color3.fromRGB(240, 90, 90)
                if res.ok then
                    showShop()
                end
            end)
        end
    end
end

-- DAILY UI
local function showDaily()
    clearView()
    createLabel(view, "Daily Reward", 30)
    local btn = createButton(view, "Claim Today")
    btn.MouseButton1Click:Connect(function()
        local res = ClaimDaily:InvokeServer()
        local color = res.ok and Color3.fromRGB(80, 220, 120) or Color3.fromRGB(240, 90, 90)
        local msg = createLabel(view, res.message or "", 28)
        msg.TextColor3 = color
    end)
end

-- Tab bindings
tabLesson.MouseButton1Click:Connect(showLessons)
tabShop.MouseButton1Click:Connect(showShop)
tabDaily.MouseButton1Click:Connect(showDaily)

-- Default view
showLessons()