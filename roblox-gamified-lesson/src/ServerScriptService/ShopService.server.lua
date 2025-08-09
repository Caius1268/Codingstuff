local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerStorage = game:GetService("ServerStorage")

local DataService = require(script.Parent:WaitForChild("DataService"))
local ShopItems = require(ServerStorage:WaitForChild("ShopItems"))

local remotes = ReplicatedStorage:WaitForChild("Remotes")
local PurchaseItem = remotes:WaitForChild("PurchaseItem") :: RemoteFunction

local RATE_LIMIT = { window = 10, max = 6 }
local purchaseThrottle: { [Player]: { windowStart: number, count: number } } = {}

local function rateLimited(player: Player)
    local now = os.clock()
    local bucket = purchaseThrottle[player]
    if not bucket or now - bucket.windowStart > RATE_LIMIT.window then
        purchaseThrottle[player] = { windowStart = now, count = 1 }
        return false
    end
    bucket.count += 1
    return bucket.count > RATE_LIMIT.max
end

local function applyItemToCharacter(player: Player, item)
    local character = player.Character or player.CharacterAdded:Wait()
    if item.type == "trail" then
        local attachment = character:FindFirstChild("RootAttachment")
        if not attachment then
            local hrp = character:FindFirstChild("HumanoidRootPart")
            if not hrp then return end
            attachment = Instance.new("Attachment")
            attachment.Name = "RootAttachment"
            attachment.Parent = hrp
        end
        local trail = attachment:FindFirstChild("LessonTrail")
        if not trail then
            trail = Instance.new("Trail")
            trail.Name = "LessonTrail"
            trail.Attachment0 = attachment
            trail.Attachment1 = attachment
            trail.Lifetime = 0.4
            trail.LightEmission = 0.9
            trail.Parent = attachment
        end
        trail.Color = ColorSequence.new(item.data.color)
    elseif item.type == "gamepass" then
        local humanoid = character:FindFirstChildOfClass("Humanoid")
        if humanoid and item.data.walkspeed then
            humanoid.WalkSpeed = item.data.walkspeed
        end
    end
end

local function applyOwnedItems(player: Player)
    local profile = DataService:get(player)
    if not profile then return end
    for _, item in ipairs(ShopItems.Items) do
        if profile.ownedItems[item.id] then
            applyItemToCharacter(player, item)
        end
    end
end

PurchaseItem.OnServerInvoke = function(player, itemId)
    if rateLimited(player) then
        return { ok = false, message = "Slow down" }
    end
    local item = ShopItems.getById(tostring(itemId))
    if not item then
        return { ok = false, message = "Invalid item" }
    end
    if DataService:isOwned(player, item.id) then
        return { ok = false, message = "Already owned" }
    end

    local profile = DataService:get(player)
    if not profile then
        return { ok = false, message = "No profile" }
    end
    if profile.coins < item.price then
        return { ok = false, message = "Not enough coins" }
    end

    DataService:adjustCoins(player, -item.price)
    DataService:setOwned(player, item.id)
    applyItemToCharacter(player, item)

    return { ok = true, message = "Purchased " .. item.name }
end

Players.PlayerAdded:Connect(function(player)
    player.CharacterAdded:Connect(function()
        applyOwnedItems(player)
    end)
end)

Players.PlayerRemoving:Connect(function(player)
    purchaseThrottle[player] = nil
end)