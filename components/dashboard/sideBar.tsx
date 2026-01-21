import { cn } from "@/lib/utils";
import {
  BookOpenIcon,
  GlobeAltIcon,
  HomeIcon,
  MicrophoneIcon,
  PencilIcon,
  SpeakerWaveIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Listening", href: "/listening", icon: SpeakerWaveIcon },
  { name: "Reading", href: "/reading", icon: BookOpenIcon },
  { name: "Writing", href: "/writing", icon: PencilIcon },
  { name: "Speaking", href: "/speaking", icon: MicrophoneIcon },
  // { name: "Analytics", href: "/analytics", icon: ChartBarIcon }, //TODO: Add Analytics
  { name: "Profile", href: "/profile", icon: UserIcon },
];

const SideBar = () => {
  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 px-6 pb-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex h-16 shrink-0 items-center gap-x-2 mt-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-purple-800 to-blue-600">
            <GlobeAltIcon className="h-5 w-5 text-white " />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            IELTS<span className="text-purple-600 text-md">Prep</span>
          </span>
        </Link>
        {/* Navigation */}
        <div className="flex flex-col gap-y-1 mt-2 ">
          <ul className="flex flex-1 flex-col gap-y-7">
            {navigation.map(({ name, href, icon: Icon }) => {
              return (
                <li key={name}>
                  <Link
                    href={href}
                    className={cn(
                      "group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors",
                      "text-gray-700 hover:text-primary hover:bg-gray-50",
                      "dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary",
                    )}>
                    <Icon className="h-6 w-6 transition-colors" />
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-auto flex flex-col gap-y-1">
          <div className="rounded-lg bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">💡Study Tip</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Practice consistently for 30 minutes daily to see improvement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
