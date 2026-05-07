import React from "react";
import { Alert } from "@material-tailwind/react";
import { Check, X  } from "lucide-react";


export default function CustomAlert({error, message, open}) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-fit px-4 ">
      <Alert open={open} color={error ? "red" : "green"} icon={error ? <X /> : <Check />} className="w-full">
        {message}
      </Alert>
    </div>
  );
}
