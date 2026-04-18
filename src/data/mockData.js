export const MOCK_DATA = {
  products: [
    {
      id: 1,
      name: "Organic Bamboo Utensil Set",
      price: 24.99,
      carbon: 0.2, // kg CO2
      image: "https://images.unsplash.com/photo-1591336395447-49277f2495ea?auto=format&fit=crop&q=80&w=400",
      category: "Home",
      stock: 15
    },
    {
      id: 2,
      name: "Hand-Block Printed Organic Cotton Kurta",
      price: 18.00,
      carbon: 0.05,
      image: "/kurta.png",
      category: "Fashion",
      stock: 42
    },
    {
      id: 3,
      name: "Solar Powered Portable Charger",
      price: 45.50,
      carbon: 1.2,
      image: "https://images.unsplash.com/photo-1617788130097-38a1a846bc4a?auto=format&fit=crop&q=80&w=400",
      category: "Tech",
      stock: 8
    },
    {
      id: 4,
      name: "Certified Refurbished Smartphone",
      price: 129.00,
      carbon: 0.8,
      image: "/phone.png",
      category: "Electronics",
      stock: 12
    },
    {
      id: 5,
      name: "Hand-Block Anarkali Organic Cotton Dress",
      price: 34.00,
      carbon: 0.04,
      image: "/anarkali.png",
      category: "Fashion",
      stock: 20
    },
    {
      id: 6,
      name: "Herbal Kajal in Bamboo Casing",
      price: 9.99,
      carbon: 0.01,
      image: "/makeup.png",
      category: "Beauty",
      stock: 60
    }
  ],
  neighborhoodItems: [
    {
      id: 101,
      name: "Power Drill",
      type: "Rent",
      price: 5,
      distance: "0.4 km",
      owner: "Sarah J.",
      verified: true,
      coords: { x: 30, y: 45 },
      image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 102,
      name: "Cargo E-Bike",
      type: "Rent",
      price: 12,
      distance: "1.2 km",
      owner: "Mark L.",
      verified: true,
      coords: { x: 70, y: 20 },
      image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 103,
      name: "Camping Tent (4 Person)",
      type: "Swap",
      price: 0,
      distance: "0.8 km",
      owner: "Emily R.",
      verified: false,
      coords: { x: 55, y: 80 },
      image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=400"
    }
  ],
  foodRescue: [
    {
      id: 201,
      restaurant: "Green Deli",
      items: "Organic Salad Bowls",
      amount: "8 portions",
      claimed: 3,
      total: 8,
      pickupBy: "19:00",
      status: "Available",
      distance: "0.5 km",
      type: "Surplus"
    },
    {
      id: 202,
      restaurant: "Urban Bakery",
      items: "Fresh Sourdough Loaves",
      amount: "12 portions",
      claimed: 10,
      total: 12,
      pickupBy: "20:30",
      status: "Available",
      distance: "1.2 km",
      type: "Rescue"
    },
    {
      id: 203,
      restaurant: "The Pasta House",
      items: "Penne Arrabbiata",
      amount: "6 portions",
      claimed: 0,
      total: 6,
      pickupBy: "21:00",
      status: "Available",
      distance: "0.8 km",
      type: "Surplus"
    },
    {
      id: 204,
      restaurant: "Spice Route",
      items: "Chicken Biryani",
      amount: "15 portions",
      claimed: 5,
      total: 15,
      pickupBy: "22:00",
      status: "NGO Accepted",
      distance: "2.5 km",
      type: "Rescue"
    },
    {
      id: 205,
      restaurant: "Sushi Zen",
      items: "Assorted Sushi Rolls",
      amount: "20 portions",
      claimed: 18,
      total: 20,
      pickupBy: "22:30",
      status: "Completed",
      distance: "1.5 km",
      type: "Surplus"
    },
    {
      id: 206,
      restaurant: "Cafe Evergreen",
      items: "Vegan Sandwiches",
      amount: "10 portions",
      claimed: 2,
      total: 10,
      pickupBy: "18:30",
      status: "Available",
      distance: "0.3 km",
      type: "Rescue"
    },
    {
      id: 207,
      restaurant: "The Daily Roast",
      items: "Morning Pastries",
      amount: "25 portions",
      claimed: 20,
      total: 25,
      pickupBy: "11:00",
      status: "Available",
      distance: "0.9 km",
      type: "Surplus"
    },
    {
      id: 208,
      restaurant: "Bowl of Plenty",
      items: "Quinoa Harvest Bowls",
      amount: "5 portions",
      claimed: 0,
      total: 5,
      pickupBy: "20:00",
      status: "Available",
      distance: "1.1 km",
      type: "Rescue"
    }
  ],
  upcycleMaterials: [
    {
      id: 301,
      name: "Denim Scraps (10kg)",
      donor: "Levi's Workshop",
      description: "High quality off-cuts for creative projects.",
      image: "https://images.unsplash.com/photo-1582298538104-fe2e74c27f59?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: 302,
      name: "Copper Wiring",
      donor: "TechRecycle Inc.",
      description: "Stripped copper ready for jewelry or art.",
      image: "https://images.unsplash.com/photo-1558484628-91e06122d73b?auto=format&fit=crop&q=80&w=400"
    }
  ],
  offsetProjects: [
    { id: 'reforest', name: 'Amazon Reforestation', cost: 2.50, description: 'Planting native trees in the Amazon rainforest.' },
    { id: 'plastic', name: 'Ocean Plastic Recovery', cost: 3.00, description: 'Removing plastic waste from coastal ecosystems.' },
    { id: 'bees', name: 'Urban Bee-keeping', cost: 1.50, description: 'Supporting pollinator habitats in city centers.' }
  ],
  communityStats: {
    totalCO2Saved: "1,245,670",
    wasteDiverted: "85,420",
    waterSaved: "2,400,000",
    activeMembers: "12,850"
  }
};
