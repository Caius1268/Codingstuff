local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Ensure Remotes Folder and required remotes exist
local remotesFolder = ReplicatedStorage:FindFirstChild("Remotes")
if not remotesFolder then
    remotesFolder = Instance.new("Folder")
    remotesFolder.Name = "Remotes"
    remotesFolder.Parent = ReplicatedStorage
end

local function ensureRemoteEvent(name: string)
    local ev = remotesFolder:FindFirstChild(name)
    if not ev then
        ev = Instance.new("RemoteEvent")
        ev.Name = name
        ev.Parent = remotesFolder
    end
    return ev
end

local function ensureRemoteFunction(name: string)
    local fn = remotesFolder:FindFirstChild(name)
    if not fn then
        fn = Instance.new("RemoteFunction")
        fn.Name = name
        fn.Parent = remotesFolder
    end
    return fn
end

ensureRemoteFunction("RequestLessons")
ensureRemoteFunction("StartLesson")
ensureRemoteFunction("SubmitAnswer")
ensureRemoteFunction("ClaimDaily")
ensureRemoteFunction("PurchaseItem")
ensureRemoteFunction("GetOwnedItems")
ensureRemoteEvent("Feedback")

-- Leaderstats created in DataService on player added