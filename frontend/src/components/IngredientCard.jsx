"use client";
import { useState } from "react";

export default function IngredientCard({ ingredient }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="card bg-base-100 shadow-md rounded-box border border-base-300">
            <figure className="pt-6">
                <img
                    src={ingredient.image}
                    alt={ingredient.name}
                    className="w-24 h-24 object-cover rounded-full"
                />
            </figure>

            <div className="card-body items-center text-center p-4">
                <div className="flex items-center gap-2">
                    <h3 className="card-title text-base-content">{ingredient.name}</h3>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="btn btn-ghost btn-xs"
                    >
                        {expanded ? "▲" : "▼"}
                    </button>
                </div>

                {/* Sliding subtitues section */}
                <div
                    className={`overflow-hidden transition-all duration-300 w-full ${
                        expanded ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
                    }`}
                >
                    <div className="divider my-1"></div>
                    <p className="text-xs text-base-content/60 font-semibold uppercase mb-1">Substitutes</p>
                    {ingredient.substitutes.split(",").map((sub, index) => (
                        <p key={index} className="text-sm text-base-content py-0.5">
                            {sub.trim()}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
}
