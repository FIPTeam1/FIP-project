"use client";
import { useState } from "react";

export default function IngredientCard({ ingredient }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            onClick={() => setExpanded(!expanded)}
            style={{
                border: "1px solid #ccc",
                padding: "12px",
                borderRadius: "10px",
                cursor: "pointer"
            }}
        >
            <img
                src={ingredient.image}
                alt={ingredient.name}
                width="80"
            />

            <h3>{ingredient.name}</h3>

            <span>{expanded ? "▲" : "▼"}</span>

            {expanded && (
                <div style={{ marginTop: "10px" }}>
                    {ingredient.substitutes.split(",").map((sub, index) => (
                        <p key={index}>{sub}</p>
                    ))}
                </div>
            )}
        </div>
    );
}