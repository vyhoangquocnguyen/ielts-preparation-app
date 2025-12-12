"use client";

import {
  HomeIcon,
  SpeakerWaveIcon,
  BookOpenIcon,
  PencilIcon,
  MicrophoneIcon,
  ChartBarIcon,
  UserIcon,
  XMarkIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Listening", href: "/listening", icon: SpeakerWaveIcon },
  { name: "Reading", href: "/reading", icon: BookOpenIcon },
  { name: "Writing", href: "/writing", icon: PencilIcon },
  { name: "Speaking", href: "/speaking", icon: MicrophoneIcon },
  { name: "Analytics", href: "/analytics", icon: ChartBarIcon },
  { name: "Profile", href: "/profile", icon: UserIcon },
];

interface MobileSideBarProps {
  open: boolean;
  onClose: () => void;
}
const MobileSideBar = ({ open, onClose }: MobileSideBarProps) => {
  console.log("open yet", open);
  console.log("onClose yet", onClose);
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-gray-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full">
            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0">
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button className="-m-2.5 p-2.5" type="button" onClick={onClose}>
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="size-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>

              <div className="flex grow flex-col gap-y-5 overflow-y-auto py-6 px-6 bg-white dark:bg-gray-900">
                <div className="flex h-16 shrink-0 items-center gap-2">
                  {/* Logo & Menu */}
                  <GlobeAltIcon className="h-8 w-8 text-white " />
                  <h1 className="text-2xl font-bold gradient-text">
                    IELTS<span className="text-purple-600 text-md">Prep</span>
                  </h1>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    {navigation.map(({ name, href, icon: Icon }) => (
                      <li key={name}>
                        <Link
                          href={href}
                          onClick={onClose}
                          className={cn(
                            "group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors",
                            "text-gray-700 hover:text-primary hover:bg-gray-50",
                            "dark:text-gray-300 dark:hover:bg-gray-800"
                          )}>
                          <Icon className="size-6" />
                          {name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MobileSideBar;
