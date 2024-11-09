import Image from "next/image";
import TransparentIcon from "@/assets/icons/icon-transparent.svg";

export default function Logo() {
  return (
    <div className="flex">
      <Image priority src={TransparentIcon} alt="Usability Tree Logo" className="h-8 w-8" />
      <div className="text-2xl font-bold">
        Usabili
        <span className="bg-gradient-to-r from-[#72FFA4] to-[#00D9C2] bg-clip-text text-transparent">
          Tree
        </span>
      </div>
    </div>
  );
}
