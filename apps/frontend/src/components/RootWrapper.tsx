import { Outlet } from "react-router-dom";

export default function RootWrapper() {
    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}
