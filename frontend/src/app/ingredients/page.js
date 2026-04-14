const ingredients = [
    {
        id: 1,
        name: "Tomato",
        image: "/tomato.png",
        subsitutes: "Cherry Tomato (~$2), Canned Tomato (~$1)"
    },
    {
        id: 2,
        name: "Milk",
        image: "/milk.png",
        substitutes: "Almond Milk (~$3), Oat Milk (~$4)"
    },
    {
        id: 3,
        name: "Eggs",
        image: "/eggs.png",
        substitutes: "Egg Whites (~$2), Tofu (~$3)"
    }
];


export default function IngredientsPage() {
    return (
        <div>
            <h1>Ingredient Glossary</h1>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "16px",
                marginTop: "20px"
            }}>
                {ingredients.map((item) => (
                    <div key={item.id} style={{
                        border: "1px solid #ccc",
                        padding: "12px",
                        borderRadius: "8px"
                    }}>
                        <h3>{item.name}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
}
