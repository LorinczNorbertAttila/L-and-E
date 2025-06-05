import React from "react";
import { Facebook, Clock, Phone, MailOpen, MapPinned } from "lucide-react";
import logoWhite from "../assets/images/lande_white.png";

const WORKING_HOURS = {
  weekdays: "Luni-vineri: 8:00-18:00",
  saturday: "Sâmbătă: 8:00-12:00",
  sunday: "Duminică: Închis",
};

export default function Footer() {
  return (
    <footer className="bg-black">
      <div className="bg-teal-900 bg-opacity-55 flex flex-col md:flex-row items-center justify-between p-4 gap-6 md:gap-10">
        <img src={logoWhite} className="w-20 h-20 md:w-24 md:h-24" alt="Logo" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
          <div className="flex flex-col gap-4 text-center md:text-left">
            <a
              href="tel:+40 (740) 068 455"
              aria-label="Call: +40 (740) 068 455"
              className="flex flex-row gap-2 items-center text-white text-sm md:text-base"
            >
              <Phone className="text-white" aria-hidden="true" />
              +40 (740) 068 455
            </a>
            <a
              href="mailto:leagroteamsrl@gmail.com"
              aria-label="Send email: leagroteamsrl@gmail.com"
              className="flex flex-row gap-2 items-center text-white text-sm md:text-base"
            >
              <MailOpen className="text-white" aria-hidden="true" />{" "}
              leagroteamsrl@gmail.com
            </a>
            <div className="flex flex-row gap-4 items-center justify-center md:justify-start">
              <a
                href="https://www.facebook.com/profile.php?id=100047988926318"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white cursor-pointer"
                aria-label="Open Facebook page"
              >
                <Facebook aria-hidden="true" />
              </a>
              <a
                href="https://www.google.com/maps/place/Fitofarmacie+L%26E+AgroTeam+srl/@47.0328083,23.9118688,17z/data=!3m1!4b1!4m6!3m5!1s0x4749bd6fb2248211:0xadfe2fd24dd28334!8m2!3d47.0328083!4d23.9118688!16s%2Fg%2F11f6165fjn?entry=ttu&g_ep=EgoyMDI1MDMxOS4yIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white cursor-pointer"
                aria-label="Open Google Maps"
              >
                <MapPinned aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="flex flex-col text-center md:text-left gap-4">
            <h1 className="text-white font-semibold">Program:</h1>
            <div className="flex flex-row gap-2">
              <Clock className="text-white rounded-full" />
              <div>
                <h2 className="text-white text-sm md:text-base">
                  {WORKING_HOURS.weekdays}
                </h2>
                <h2 className="text-white text-sm md:text-base">
                  {WORKING_HOURS.saturday}
                </h2>
                <h2 className="text-white text-sm md:text-base">
                  {WORKING_HOURS.sunday}
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
