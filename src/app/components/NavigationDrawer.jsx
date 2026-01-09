"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useDrawer } from './DrawerProvider';
import {
  HomeIcon,
  FireIcon,
  FilmIcon,
  BookOpenIcon,
  CalendarIcon,
  Cog6ToothIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  TvIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

// Menu groups - defined outside component to avoid dependency issues
const getMenuGroups = () => [
  {
    id: "anime",
    title: "Anime",
    icon: TvIcon,
    links: [
      { href: "/", name: "Home", Icon: HomeIcon },
      { href: "/populer", name: "Populer", Icon: FireIcon },
      { href: "/movie", name: "Movie", Icon: FilmIcon },
      { href: "/genre", name: "Genre List", Icon: BookOpenIcon },
      { href: "/schedule", name: "Schedule", Icon: CalendarIcon },
    ],
  },
  {
    id: "drakor",
    title: "Drakor",
    icon: TvIcon,
    links: [
      { href: "/drakor", name: "Home", Icon: HomeIcon },
      { href: "/drakor/ongoing", name: "Ongoing", Icon: ClockIcon },
      { href: "/drakor/populer", name: "Populer", Icon: FireIcon },
      { href: "/drakor/series", name: "Series", Icon: TvIcon },
      { href: "/drakor/movie", name: "Movie", Icon: FilmIcon },
      { href: "/drakor/complete", name: "Complete", Icon: CheckCircleIcon },
      { href: "/drakor/genre", name: "Genre List", Icon: BookOpenIcon },
    ],
  },
];

const NavigationDrawer = ({ user }) => {
  const { isExpanded, setIsExpanded } = useDrawer();
  const pathname = usePathname();
  const useDatabase = process.env.NEXT_PUBLIC_USE_DATABASE === 'true';

  // State untuk track expanded groups
  const [expandedGroups, setExpandedGroups] = useState({});

  // Menu groups
  const menuGroups = getMenuGroups();

  // Auto-expand group jika pathname match dengan salah satu link
  useEffect(() => {
    const newExpandedGroups = {};
    menuGroups.forEach((group) => {
      if (group.links.length > 0) {
        const hasActiveLink = group.links.some((link) => {
          if (link.href === "/") {
            return pathname === "/";
          }
          return pathname.startsWith(link.href);
        });
        if (hasActiveLink) {
          newExpandedGroups[group.id] = true;
        }
      }
    });
    setExpandedGroups(newExpandedGroups);
  }, [pathname]);

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // User menu items
  const userMenuItems = [];
  if (useDatabase) {
    if (user) {
      userMenuItems.push({ href: "/users/dashboard", name: "Dashboard", Icon: Cog6ToothIcon });
      userMenuItems.push({ href: "/users/dashboard/my-history", name: "History", Icon: ClockIcon });
      userMenuItems.push({ href: "/api/auth/signout", name: "Logout", Icon: ArrowLeftOnRectangleIcon });
    } else {
      userMenuItems.push({ href: "/api/auth/signin", name: "Login", Icon: ArrowRightOnRectangleIcon });
    }
  } else {
    userMenuItems.push({ href: "/users/dashboard/my-history", name: "History", Icon: ClockIcon });
    if (user) {
      userMenuItems.push({ href: "/users/dashboard", name: "Dashboard", Icon: Cog6ToothIcon });
      userMenuItems.push({ href: "/api/auth/signout", name: "Logout", Icon: ArrowLeftOnRectangleIcon });
    }
  }

  const toggleDrawer = () => {
    setIsExpanded(!isExpanded);
  };



  return (
    <>
      {/* Drawer - Always visible, collapsed or expanded */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#1A1A29] border-r border-neutral-700 z-[95] transition-all duration-300 ease-in-out ${isExpanded ? 'w-64' : 'w-20'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Toggle Button */}
          <button
            onClick={toggleDrawer}
            className="w-full p-4 border-b border-neutral-700 hover:bg-neutral-800 transition-colors flex items-center justify-center"
            aria-label={isExpanded ? "Collapse drawer" : "Expand drawer"}
          >
            {isExpanded ? (
              <ChevronLeftIcon className="w-6 h-6 text-white" />
            ) : (
              <ChevronRightIcon className="w-6 h-6 text-white" />
            )}
          </button>

          {/* Navigation Content */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-2">
              {/* Menu Groups */}
              {menuGroups.map((group, groupIndex) => {
                // Skip group jika tidak ada links
                if (group.links.length === 0) return null;

                const isGroupExpanded = expandedGroups[group.id] || false;
                const GroupIcon = group.icon;

                return (
                  <div key={group.id} className={groupIndex > 0 ? 'pt-2 border-t border-neutral-700' : ''}>
                    {/* Group Button */}
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${isGroupExpanded
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                        } ${isExpanded ? 'justify-between' : 'justify-center'}`}
                      title={!isExpanded ? group.title : ''}
                    >
                      <div className="flex items-center gap-3">
                        <GroupIcon className="w-6 h-6 flex-shrink-0 text-white group-hover:text-pink-400" />
                        {isExpanded && (
                          <span className="font-medium whitespace-nowrap">{group.title}</span>
                        )}
                      </div>
                      {isExpanded && (
                        <ChevronDownIcon
                          className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${isGroupExpanded ? 'rotate-180' : ''
                            }`}
                        />
                      )}
                    </button>

                    {/* Group Links - Only show when expanded */}
                    {isGroupExpanded && (
                      <ul className="space-y-1 mt-1 ml-2 pl-2 border-l border-neutral-700">
                        {group.links.map((link) => {
                          const isActive = pathname === link.href ||
                            (link.href !== "/" && pathname.startsWith(link.href));
                          const IconComponent = link.Icon;

                          return (
                            <li key={link.href}>
                              <Link
                                href={link.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                  ? 'bg-pink-600 text-white'
                                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                                  } ${isExpanded ? 'justify-start' : 'justify-center'}`}
                                title={!isExpanded ? link.name : ''}
                              >
                                <IconComponent className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-white group-hover:text-pink-400'}`} />
                                {isExpanded && (
                                  <span className="font-medium whitespace-nowrap text-sm">{link.name}</span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}

              {/* User Menu Section */}
              {userMenuItems.length > 0 && (
                <div className="pt-2 border-t border-neutral-700">
                  {isExpanded && (
                    <div className="px-3 py-2 mb-2">
                      <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        Account
                      </h3>
                    </div>
                  )}
                  <ul className="space-y-1">
                    {userMenuItems.map((link) => {
                      const isActive = pathname === link.href ||
                        (link.href !== "/" && pathname.startsWith(link.href));
                      const IconComponent = link.Icon;

                      return (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${isActive
                              ? 'bg-pink-600 text-white'
                              : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                              } ${isExpanded ? 'justify-start' : 'justify-center'}`}
                            title={!isExpanded ? link.name : ''}
                          >
                            <IconComponent className={`w-6 h-6 flex-shrink-0 ${isActive ? 'text-white' : 'text-white group-hover:text-pink-400'}`} />
                            {isExpanded && (
                              <span className="font-medium whitespace-nowrap">{link.name}</span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </nav>

          {/* Footer */}
          {isExpanded && (
            <div className="p-4 border-t border-neutral-700">
              <p className="text-xs text-neutral-500 text-center">
                StudentArt-Anime
              </p>
            </div>
          )}
        </div>
      </div>

    </>
  );
};

export default NavigationDrawer;
