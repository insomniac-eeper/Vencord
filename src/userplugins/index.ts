/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import definePlugin from "@utils/types";
import { findByPropsLazy, findStoreLazy } from "@webpack";
import { GuildChannelStore, ReadStateStore } from "@webpack/common";
import type { Channel, Guild } from "discord-types/general";

interface ThreadJoined {
    channel: Channel;
    joinTimestamp: number;
}

type ThreadsJoined = Record<string, ThreadJoined>;
type ThreadsJoinedByParent = Record<string, ThreadsJoined>;

interface ActiveJoinedThreadsStore {
    getActiveJoinedThreadsForGuild(guildId: string): ThreadsJoinedByParent;
}

const ActiveJoinedThreadsStore: ActiveJoinedThreadsStore = findStoreLazy("ActiveJoinedThreadsStore");
const { updateGuildNotificationSettings } = findByPropsLazy("updateGuildNotificationSettings");

interface GuildContextProps {
    guild?: Guild;
}

interface ChannelProps {
    channel?: Channel;
}

const GuildContext: NavContextMenuPatchCallback = (children, { guild }: GuildContextProps) => {
    if (!guild) return;

    const channels: Array<any> = [];

    GuildChannelStore.getChannels(guild.id).SELECTABLE // Array<{ channel, comparator }>
        .concat(GuildChannelStore.getChannels(guild.id).VOCAL) // Array<{ channel, comparator }>
        .concat(
            Object.values(ActiveJoinedThreadsStore.getActiveJoinedThreadsForGuild(guild.id))
                .flatMap(threadChannels => Object.values(threadChannels))
        )
        .forEach((c: { channel: { id: string; }; }) => {
            if (!ReadStateStore.hasUnread(c.channel.id)) return;

            channels.push({
                channelId: c.channel.id
            });
        });

    updateGuildNotificationSettings(guild.id, {

    });

};

export default definePlugin({
    name: "Mute All Channels",
    description: "Mutes all channels in a server",
    authors: [
        {
            id: 12345n,
            name: "insomniac-eeper",
        },
    ],
    contextMenus: {
        "guild-context": GuildContext
    },

    patches: [],
    // Delete these two below if you are only using code patches
    start() { },
    stop() { },
});
