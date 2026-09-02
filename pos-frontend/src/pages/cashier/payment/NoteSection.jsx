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
    <div className="p-3.5 space-y-1.5">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <FileText className="w-3.5 h-3.5 text-[#B8860B]" />
        Special Instructions
      </h3>
      <textarea
        className="w-full p-2 bg-background border border-border rounded-xl text-xs placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
        rows="2"
        placeholder="Add order note, delivery or till notes..."
        value={note || ""}
        onChange={handleSetNote}
      />
    </div>
  );
};

export default NoteSection;
