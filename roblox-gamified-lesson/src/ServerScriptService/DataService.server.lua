local DataStoreService = game:GetService("DataStoreService")

local playerDataStore = DataStoreService:GetDataStore("PlayerLessonData_v1")

local DataService = {}
DataService.playerProfiles = {}

export type PlayerProfile = {
    coins: number,
    xp: number,
    ownedItems: { [string]: boolean },
    daily: { lastClaim: number, streak: number },
    lessons: { [string]: { bestScore: number } },
}

local DEFAULT_PROFILE: PlayerProfile = {
    coins = 0,
    xp = 0,
    ownedItems = {},
    daily = { lastClaim = 0, streak = 0 },
    lessons = {},
}

local function deepCopy(tbl)
    local t = {}
    for k, v in pairs(tbl) do
        if typeof(v) == "table" then
            t[k] = deepCopy(v)
        else
            t[k] = v
        end
    end
    return t
end

function DataService:get(player: Player): PlayerProfile
    return self.playerProfiles[player]
end

function DataService:load(player: Player)
    local key = ("player_%d"):format(player.UserId)
    local ok, data = pcall(function()
        return playerDataStore:GetAsync(key)
    end)
    local profile: PlayerProfile = deepCopy(DEFAULT_PROFILE)
    if ok and typeof(data) == "table" then
        for k, v in pairs(data) do
            profile[k] = v
        end
    end
    self.playerProfiles[player] = profile

    -- Leaderstats
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player

    local coins = Instance.new("IntValue")
    coins.Name = "Coins"
    coins.Value = profile.coins
    coins.Parent = leaderstats

    local xp = Instance.new("IntValue")
    xp.Name = "XP"
    xp.Value = profile.xp
    xp.Parent = leaderstats
end

function DataService:save(player: Player)
    local profile = self.playerProfiles[player]
    if not profile then return end
    local key = ("player_%d"):format(player.UserId)
    pcall(function()
        playerDataStore:SetAsync(key, profile)
    end)
end

function DataService:adjustCoins(player: Player, delta: number)
    local profile = self.playerProfiles[player]
    if not profile then return end
    profile.coins = math.max(0, profile.coins + delta)
    local coins = player:FindFirstChild("leaderstats") and player.leaderstats:FindFirstChild("Coins")
    if coins then coins.Value = profile.coins end
end

function DataService:addXP(player: Player, delta: number)
    local profile = self.playerProfiles[player]
    if not profile then return end
    profile.xp = math.max(0, profile.xp + delta)
    local xp = player:FindFirstChild("leaderstats") and player.leaderstats:FindFirstChild("XP")
    if xp then xp.Value = profile.xp end
end

function DataService:setOwned(player: Player, itemId: string)
    local profile = self.playerProfiles[player]
    if not profile then return end
    profile.ownedItems[itemId] = true
end

function DataService:isOwned(player: Player, itemId: string): boolean
    local profile = self.playerProfiles[player]
    if not profile then return false end
    return profile.ownedItems[itemId] == true
end

function DataService:updateLessonBest(player: Player, lessonId: string, score: number)
    local profile = self.playerProfiles[player]
    if not profile then return end
    profile.lessons[lessonId] = profile.lessons[lessonId] or { bestScore = 0 }
    profile.lessons[lessonId].bestScore = math.max(profile.lessons[lessonId].bestScore, score)
end

function DataService:getDaily(player: Player)
    local profile = self.playerProfiles[player]
    if not profile then return { lastClaim = 0, streak = 0 } end
    return profile.daily
end

function DataService:setDaily(player: Player, lastClaim: number, streak: number)
    local profile = self.playerProfiles[player]
    if not profile then return end
    profile.daily.lastClaim = lastClaim
    profile.daily.streak = streak
end

-- Connections
local Players = game:GetService("Players")
Players.PlayerAdded:Connect(function(player)
    DataService:load(player)
end)

Players.PlayerRemoving:Connect(function(player)
    DataService:save(player)
    DataService.playerProfiles[player] = nil
end)

return DataService