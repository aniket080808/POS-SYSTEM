import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectNote, setNote } from "../../../Redux Toolkit/features/cart/cartSlice";
import { FileText } from "lucide-react";

const NoteSection = () => {
  const dispatch = useDispatch();
  const note = useSelector(selectNote);

  const handleSetNote = (e) => {
    dispatch(setNote(e.target.value));
  };

  return (
    <div className="p-4 space-y-2">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        Order Note
      </h3>
      <textarea
        className="w-full p-2.5 bg-background border border-border/80 rounded-xl text-xs placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs"
        rows="2"
        placeholder="Add special instructions or delivery note..."
        value={note || ""}
        onChange={handleSetNote}
      />
    </div>
  );
};

export default NoteSection;
