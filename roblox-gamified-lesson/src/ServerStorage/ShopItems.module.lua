local ShopItems = {}

-- Developer: Add more items here.
ShopItems.Items = {
    { id = "trail_red", name = "Red Trail", type = "trail", price = 50, data = { color = Color3.fromRGB(255, 70, 70) } },
    { id = "trail_blue", name = "Blue Trail", type = "trail", price = 50, data = { color = Color3.fromRGB(70, 120, 255) } },
    { id = "speed_boost", name = "Speed Boost", type = "gamepass", price = 150, data = { walkspeed = 24 } },
}

function ShopItems.getById(itemId: string)
    for _, item in ipairs(ShopItems.Items) do
        if item.id == itemId then
            return item
        end
    end
    return nil
end

return ShopItems