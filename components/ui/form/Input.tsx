"use client";

export default function Input(props: any) {
  return (
    <input
      {...props}
      className={`w-full pl-11 pr-3 py-[14px] leading-none rounded-xl 
      border border-gray-200 bg-white
      focus:ring-2 focus:ring-green-400 focus:border-transparent 
      outline-none transition-all ${props.className || ""}`}
    />
  );
}
