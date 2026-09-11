(function (root) {
  const PRODUCTS_KEY = "Ianhe-products";
  const ORDERS_KEY = "Ianhe-orders";
  const defaultProducts = [
    {
      id: "chicken-berry", name: "莓果鸡胸训练粒", category: "鸡肉零食", petTypes: ["dog", "cat", "general"],
      price: 39, monthlySales: 2550, spec: "80g / 袋", tagline: "低脂小粒，适合外出训练和日常奖励。",
      ingredients: "鸡胸肉、蔓越莓、南瓜粉、少量亚麻籽", suitableFor: "犬猫通用，3 个月以上",
      palatability: "软硬适中，小型犬和猫咪也容易咀嚼", image: "assets/product-chicken.png"
    },
    {
      id: "freeze-salmon", name: "三文鱼冻干脆粒", category: "冻干食品", petTypes: ["dog", "cat", "general"],
      price: 56, monthlySales: 1820, spec: "60g / 罐", tagline: "高蛋白冻干，拌粮或单独奖励都顺手。",
      ingredients: "三文鱼、鸡蛋黄、少量鱼油", suitableFor: "猫咪、成犬、需要蛋白补给的宠物",
      palatability: "香气明显，适合挑嘴宠物尝鲜", image: "assets/product-freeze-dried.png"
    },
    {
      id: "dental-herb", name: "草本洁齿咀嚼棒", category: "洁齿食品", petTypes: ["dog"],
      price: 42, monthlySales: 1360, spec: "7 支 / 盒", tagline: "纤维质地更耐嚼，帮助日常口气管理。",
      ingredients: "豌豆纤维、薄荷叶粉、欧芹粉、鸡肉粉", suitableFor: "中小型犬，6 个月以上",
      palatability: "淡草本香，适合饭后咀嚼", image: "assets/product-dental.png"
    },
    {
      id: "training-duck", name: "鸭肉南瓜奖励方", category: "训练奖励", petTypes: ["dog"],
      price: 35, monthlySales: 2140, spec: "90g / 袋", tagline: "一口大小不掉渣，适合训练频繁给食。",
      ingredients: "鸭胸肉、南瓜、燕麦、椰子粉", suitableFor: "犬类，尤其适合训练期宠物",
      palatability: "香味温和，连续奖励也不容易腻", image: "assets/product-training.png"
    },
    {
      id: "chicken-cheese", name: "鸡肉羊奶酪小方", category: "鸡肉零食", petTypes: ["dog"],
      price: 46, monthlySales: 980, spec: "75g / 盒", tagline: "鸡肉搭配羊奶酪，口感柔软浓郁。",
      ingredients: "鸡胸肉、羊奶酪、蛋黄粉、马铃薯淀粉", suitableFor: "幼犬、成犬、老年犬",
      palatability: "奶香明显，适合需要柔软口感的宠物", image: "assets/product-chicken-cheese.png"
    },
    {
      id: "freeze-beef", name: "牛肉冻干能量块", category: "冻干食品", petTypes: ["dog"],
      price: 62, monthlySales: 760, spec: "70g / 罐", tagline: "肉香扎实，适合运动后或拌粮加餐。",
      ingredients: "牛肉、牛肝、少量蛋黄粉", suitableFor: "犬类，活动量较高的宠物",
      palatability: "肉香浓，适合高奖励价值场景", image: "assets/product-beef.png"
    },
    {
      id: "dental-pumpkin", name: "南瓜洁齿软棒", category: "洁齿食品", petTypes: ["dog"],
      price: 38, monthlySales: 1180, spec: "10 支 / 袋", tagline: "比硬棒更温和，适合咀嚼力一般的小型犬。",
      ingredients: "南瓜泥、豌豆蛋白、苹果纤维、欧芹粉", suitableFor: "小型犬、老年犬",
      palatability: "柔韧不粘牙，饭后奖励友好", image: "assets/product-pumpkin.png"
    },
    {
      id: "training-fish", name: "金枪鱼训练薄片", category: "训练奖励", petTypes: ["cat", "general"],
      price: 49, monthlySales: 1570, spec: "65g / 袋", tagline: "薄片易掰开，猫咪和小型犬都能快速入口。",
      ingredients: "金枪鱼、鸡胸肉、海藻粉", suitableFor: "猫咪、小型犬",
      palatability: "鲜味强，适合召回和互动训练", image: "assets/product-fish.png"
    }
  ];

  function readArray(key) {
    try {
      const value = JSON.parse(root.localStorage?.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function getAllProducts() {
    const custom = readArray(PRODUCTS_KEY).map(product => ({
      ...product,
      category: product.category || product.foodCategory || "其他食品",
      petTypes: Array.isArray(product.petTypes) ? product.petTypes : [product.petCategory || "general"],
      monthlySales: Number(product.monthlySales ?? product.sales ?? 0),
      price: Number(product.price || 0)
    }));
    const ids = new Set(defaultProducts.map(product => product.id));
    return [...defaultProducts, ...custom.filter(product => !ids.has(product.id))];
  }

  function getOrders() {
    return readArray(ORDERS_KEY);
  }

  function saveOrder(order) {
    const orders = getOrders();
    orders.unshift(order);
    root.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return order;
  }

  function createOrderId() {
    return `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  }

  root.PettreatsData = { PRODUCTS_KEY, ORDERS_KEY, defaultProducts, getAllProducts, getOrders, saveOrder, createOrderId };
})(typeof window !== "undefined" ? window : globalThis);
