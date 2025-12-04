import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ChatPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            profileImage: true,
        }
    });

    if (!targetUser) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-[#0b141a] flex flex-col">
            <ChatHeader
                title={targetUser.name}
                profileImage={targetUser.profileImage}
                online={true}
                userId={targetUser.id}
            />
            <div className="pt-16 flex-1 flex flex-col">
                <ChatInterface targetUser={targetUser} />
            </div>
        </main>
    );
}
