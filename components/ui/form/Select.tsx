"use client";

export default function Select(props: any) {
  return (
    <select
      {...props}
      className={`w-full pl-11 pr-10 py-[14px] leading-normal rounded-xl 
      border border-gray-200 bg-white text-gray-700
      focus:ring-2 focus:ring-green-400 focus:border-transparent 
      outline-none transition-all appearance-none ${props.className || ""}`}
    />
  );
}
