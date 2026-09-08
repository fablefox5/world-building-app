import Deck from "../features/deck/Deck";
import type { CardType } from "../lib/types";

export default function Card({type, range}: CardType) {
    return (
        <div className="bg-gray-500 p-2 rounded-xl w-50 flex flex-col">
                        <span className="text-md text-white">{type}</span>
                        {/* <span className="text-emerald-200 text-sm">{deck.getCardByIndex(index).range[selectedRanges[index]]}</span> */}
                        { <ul className="flex flex-col gap-1">
                            {range.map((element) => 
                                {
                                    return (
                                    <li style={{color:'#FFFFFF'}}>
                                        {element}
                                    </li>
                                    )
                                }
                            )}
                        </ul> }
        </div>)
}