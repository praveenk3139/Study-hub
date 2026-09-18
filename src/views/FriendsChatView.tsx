import React, { useState } from 'react';
import {
  Users,
  MessageSquare,
  Send,
  Plus,
  Clock,
  Sparkles,
  Search,
  CheckCircle2
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const FriendsChatView: React.FC = () => {
  const { friends, chatMessages, sendMessage, studyRooms, createStudyRoom } = useStudy();

  const [selectedFriendId, setSelectedFriendId] = useState<string>(friends[0]?.id || "fr-1");
  const [inputText, setInputText] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomSubject, setRoomSubject] = useState('Data Structures');

  const activeFriend = friends.find(f => f.id === selectedFriendId) || friends[0];
  const currentChat = chatMessages[selectedFriendId] || [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(selectedFriendId, inputText.trim());
    setInputText('');
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    createStudyRoom(roomName.trim(), roomSubject);
    setRoomName('');
    setShowCreateRoom(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Peer Study & Collaborative Rooms
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Share progress, discuss doubts, and hold synchronous focus sprints with classmates.
          </p>
        </div>
        <button
          onClick={() => setShowCreateRoom(true)}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Study Room</span>
        </button>
      </div>

      {/* Active Study Rooms Bar */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          Active Live Study Rooms
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {studyRooms.map(room => (
            <div
              key={room.id}
              className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {room.subject}
                </span>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{room.name}</p>
                <p className="text-[11px] text-slate-400">
                  {room.participantsCount} / {room.maxParticipants} Students Active
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{room.activeTimer}</span>
                </div>
                <button
                  onClick={() => alert(`Joined room: ${room.name}! Focus session active.`)}
                  className="mt-2 px-3 py-1 text-[11px] font-bold bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                >
                  Join Room
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Friends & Chat Messenger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[560px]">
        {/* Friends List Column */}
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white px-2">Classmates ({friends.length})</h2>

          <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
            {friends.map(friend => {
              const isSelected = friend.id === activeFriend?.id;
              return (
                <div
                  key={friend.id}
                  onClick={() => setSelectedFriendId(friend.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
                    />
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-800 ${
                      friend.status === 'studying' ? 'bg-emerald-500' : friend.status === 'online' ? 'bg-blue-500' : 'bg-slate-400'
                    }`} />
                  </div>

                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{friend.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{friend.currentActivity}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Messages Column */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/90 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex flex-col overflow-hidden">
          {activeFriend && (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-700/60 flex items-center gap-3">
                <img
                  src={activeFriend.avatar}
                  alt={activeFriend.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">{activeFriend.name}</h3>
                  <p className="text-[10px] text-slate-400">{activeFriend.currentActivity}</p>
                </div>
              </div>

              {/* Chat stream */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {currentChat.map(msg => {
                  const isMe = msg.senderId === 'me';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[75%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-tr-xs'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.timestamp}</span>
                    </div>
                  );
                })}
              </div>

              {/* Chat input */}
              <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-700/60 flex gap-2">
                <input
                  type="text"
                  placeholder={`Message ${activeFriend.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Virtual Study Room</h3>
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Room Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Trees & AVL Rotation Sprint"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <select
                  value={roomSubject}
                  onChange={(e) => setRoomSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Data Structures">Data Structures</option>
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="DBMS">DBMS</option>
                  <option value="Operating Systems">Operating Systems</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateRoom(false)}
                  className="px-4 py-2 text-xs text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl"
                >
                  Launch Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
