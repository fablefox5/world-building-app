import type { CardType } from "../lib/types"

type LogSubmissionType = {
    // card: CardType
}

export default function LogSubmissionModal({}: LogSubmissionType) {
    return (
        <form className="flex flex-col gap-5 justify-center items-center bg-slate-200 rounded-xl p-5">
            <h1>New Log Entry</h1>
            <div className="">
                <h2>Title</h2>
                <input id="title" name="title" type="text" className="w-100" placeholder="Enter title here..."></input>
            </div>
            <div>
                <h2>Notes</h2>
                <textarea id="notes" name="notes" placeholder="Enter notes here..." rows={6} cols={50} className="min-h-30 field-sizing-content w-100"></textarea>
            </div>
            <button type="submit" className="">Submit New Log</button>
        </form>
    )
}