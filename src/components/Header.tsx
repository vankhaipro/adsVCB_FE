"use client";

import { Bell, List, CheckCircle } from "@phosphor-icons/react";

export default function Header() {
  return (
    <header className="h-[52px] bg-[#111827] border-b border-[#1f2937] flex items-center justify-between px-4 sticky top-0 z-10 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button className="text-gray-400 hover:text-white lg:hidden">
          <List size={24} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative text-gray-400 hover:text-white">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-[#111827]"></span>
        </button>

        {/* System Status */}
        <div className="hidden md:flex items-center gap-2 bg-[#1f2937] px-3 py-1.5 rounded-full text-xs text-green-500 border border-green-500/20">
          <CheckCircle size={14} weight="fill" />
          Hệ thống đang chạy
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1f2937]">
          <div className="w-8 h-8 rounded-full bg-gray-600 overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random" alt="User Avatar" />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-medium text-gray-200 leading-tight">Nguyễn Văn A</span>
            <span className="text-[10px] text-gray-500">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
