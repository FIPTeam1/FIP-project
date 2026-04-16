"use client";
import { useState } from "react";

export default function IngredientCard({ ingredient }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="card bg-base-100 shadow-md rounded-box border border-base-300 overflow-hidden">

            {/* Image — hidden when expanded */}
            {!expanded && (
                <figure>
                    <img
                        src={ingredient.image}
                        alt={ingredient.name}
                        className="w-full h-48 object-cover"
                    />
                </figure>
            )}

            {/* Substitutes — shown when expanded */}
            {expanded && (
                <div className="p-4 flex flex-col gap-3">
                    {ingredient.substitutes.map((sub, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <img
                                src={sub.image}
                                alt={sub.name}
                                className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                                <p className="font-semibold text-base-content">{sub.name}</p>
                                <p className="text-sm text-base-content/60">{sub.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Bottom bar — always visible */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-base-300">
                <h3 className="font-semibold text-base-content">{ingredient.name}</h3>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="btn btn-ghost btn-circle btn-sm border border-base-300"
                >
                    {expanded ? "▲" : "▼"}
                </button>
            </div>

        </div>
    );
}