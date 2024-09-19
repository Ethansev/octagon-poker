'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getPlayerById } from '@/dal/player';
import {
  createPlayerSessions,
  NewPlayerSession,
  PlayerSession,
  PlayerSessionWithPlayerInfo,
  TableEntry,
  updatePlayerSessions,
} from '@/dal/player-session';
import { useGameStore } from '@/store/game';
import { useRouter } from 'next/navigation';
import React, { ReactElement, useEffect, useState } from 'react';

type Props = {
  initialData: PlayerSessionWithPlayerInfo[];
  gameId?: number;
};

type FieldInput = 'first_name' | 'total_cashout' | 'total_cashin' | 'total_earnings' | 'rebuys';

// Player Session table
// TODO: flexible enough to support editing from both the game and player pages
export default function EditableTable({ initialData, gameId }: Props) {
  console.log('initialData: ', initialData);
  const router = useRouter();
  const [playerSessionData, setPlayerSessionData] = useState<TableEntry[]>([]);
  const [editingCell, setEditingCell] = useState<{ id: number; field: keyof TableEntry } | null>(
    null,
  );
  // TODO: probably a better way to do this but should work for now
  const [updatedPlayerIds, setUpdatedPlayerIds] = useState<number[]>([]);
  const { activePlayerIds, resetActivePlayerIds } = useGameStore();

  // Fixes the problem where activePlayerIds is not reset after modal is closed
  useEffect(() => {
    return () => {
      resetActivePlayerIds();
    };
  }, []);

  useEffect(() => {
    // TODO: this is probably buggy so fix and refactor when we get a chance
    async function updatePlayerSessionData() {
      let newPlayerSessionData: TableEntry[] = [];
      if (gameId) {
        for (const playerId of activePlayerIds) {
          const playerSession = initialData.find((session) => session.player_id === playerId);
          if (!playerSession) {
            const currentPlayer = await getPlayerById(playerId);
            // TODO: mark as new and insert into db all at once
            newPlayerSessionData.push({
              player_id: playerId,
              game_id: gameId,
              rebuys: undefined,
              buy_in: undefined,
              total_cashin: undefined,
              total_cashout: undefined,
              total_earnings: undefined,
              net_earnings_before: currentPlayer.net_earnings,
              first_name: currentPlayer.first_name,
              last_name: currentPlayer.last_name ?? '',
              username: currentPlayer.username ?? '',
              isNew: true,
            });
          } else {
            newPlayerSessionData.push({ ...playerSession, isNew: false });
          }
        }
      } else {
        newPlayerSessionData = initialData.map((session) => ({ ...session, isNew: false }));
      }

      setPlayerSessionData(newPlayerSessionData);
    }

    updatePlayerSessionData();
  }, [activePlayerIds, gameId]);

  function FieldInput(field: FieldInput, personSession: TableEntry): ReactElement {
    const inputValue = personSession[field] ?? '';
    switch (field) {
      case 'first_name':
        return (
          <Input
            className='h-8'
            disabled={true}
            defaultValue={inputValue}
            autoFocus
            onBlur={(e) => handleSave(personSession.player_id, field, e.target.value)}
            onKeyDown={(e) =>
              handleKeyDown(e, personSession.player_id, field, e.currentTarget.value)
            }
            // placeholder={`Enter ${field}`}
          />
        );

      case 'total_earnings':
        return (
          <Input
            className='h-8'
            type='number'
            disabled={true}
            defaultValue={inputValue}
            autoFocus
            onBlur={(e) => handleSave(personSession.player_id, field, e.target.value)}
            onKeyDown={(e) =>
              handleKeyDown(e, personSession.player_id, field, e.currentTarget.value)
            }
            // placeholder={`Enter ${field}`}
          />
        );

      case 'rebuys':
        return (
          <Input
            className='h-8'
            type='number'
            defaultValue={inputValue}
            autoFocus
            onBlur={(e) => handleSave(personSession.player_id, field, e.target.value)}
            onKeyDown={(e) =>
              handleKeyDown(e, personSession.player_id, field, e.currentTarget.value)
            }
            // placeholder={`Enter ${field}`}
          />
        );

      default:
        return (
          <div className='relative'>
            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500'>$</span>
            <Input
              className='h-8 pl-6 text-left'
              type='number'
              defaultValue={inputValue}
              autoFocus
              onBlur={(e) => handleSave(personSession.player_id, field, e.target.value)}
              onKeyDown={(e) =>
                handleKeyDown(e, personSession.player_id, field, e.currentTarget.value)
              }
              // placeholder={`Enter ${field}`}
            />
          </div>
        );
    }
  }

  function renderFieldPlaceholder(field: FieldInput): ReactElement {
    switch (field) {
      case 'first_name':
        return <></>;

      case 'total_earnings':
        return <></>;

      default:
        return <span className='text-gray-400'>click to edit</span>;
    }
  }

  function FieldDisplay(field: FieldInput, personSession: TableEntry): ReactElement {
    switch (field) {
      case 'first_name':
        return <>{personSession[field as keyof TableEntry]}</>;

      case 'rebuys':
        return <>{personSession[field as keyof TableEntry]}</>;

      default:
        return <>${personSession[field as keyof TableEntry]}</>;
    }
  }

  function handleSave(playerId: number, field: keyof TableEntry, value: string) {
    const processedValue = value === 'undefined' || value === '' ? undefined : value;

    setPlayerSessionData((prevData) =>
      prevData.map((session) =>
        session.player_id === playerId ? { ...session, [field]: processedValue } : session,
      ),
    );
    // setUpdatedPlayerIds((prev) => Array.from(new Set([...prev, playerId])));
    if (!updatedPlayerIds.includes(playerId)) {
      setUpdatedPlayerIds([...updatedPlayerIds, playerId]);
    }
    setEditingCell(null);
  }

  function handleKeyDown(
    e: React.KeyboardEvent,
    id: number,
    field: keyof TableEntry,
    value: string,
  ) {
    if (e.key === 'Enter') {
      handleSave(id, field, value);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  }

  function onSaveHandler() {
    console.log(playerSessionData);
    console.log('updatedPlayerIds: ', updatedPlayerIds);

    const insertData = playerSessionData
      .filter((entry) => entry.isNew && updatedPlayerIds.includes(entry.player_id))
      .map(
        ({
          player_id,
          game_id,
          rebuys,
          buy_in,
          total_cashin,
          total_cashout,
          cumulative_earnings,
        }) => ({
          player_id,
          game_id,
          rebuys,
          buy_in: buy_in ?? 0,
          total_cashin,
          total_cashout,
          cumulative_earnings,
        }),
      ) as NewPlayerSession[];

    const updateData = playerSessionData
      .filter(
        (entry): entry is TableEntry & { id: number } =>
          !entry.isNew && updatedPlayerIds.includes(entry.player_id),
        // !entry.isNew && entry.player_id in updatedPlayerIds, // this checks for the existence of the property in an object
      )
      .map(
        ({
          id,
          player_id,
          game_id,
          rebuys,
          buy_in,
          total_cashin,
          total_cashout,
          cumulative_earnings,
        }) => ({
          id,
          player_id,
          game_id,
          rebuys,
          buy_in,
          total_cashin,
          total_cashout,
          cumulative_earnings,
        }),
      ) as PlayerSession[];

    console.log('insertData: ', insertData);
    console.log('updateData: ', updateData);

    // TODO: handle errors separately
    try {
      createPlayerSessions(insertData);
      updatePlayerSessions(updateData);
      router.refresh(); // TODO: check if thus causes any unnecessary rerenders or if there's a better way to do it
    } catch (error) {
      console.error('Error saving data: ', error);
    }
  }

  // TODO: playerSessionData needs to either be moved zustand or updated directly

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Total Cashin</TableHead>
            <TableHead>Total Cashout</TableHead>
            <TableHead>Total Earnings</TableHead>
            <TableHead>Rebuys</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playerSessionData.map((personSession) => (
            <TableRow key={personSession.player_id} className='h-12'>
              {(
                ['first_name', 'total_cashin', 'total_cashout', 'total_earnings', 'rebuys'] as const
              ).map((field) => (
                <TableCell className='w-1/6 py-0' key={field}>
                  <div className='block h-full w-full'>
                    {editingCell?.id === personSession.player_id && editingCell?.field === field ? (
                      FieldInput(field, personSession)
                    ) : (
                      <span
                        onClick={() =>
                          // handleEdit(personSession.player_id, field as keyof TableEntry)
                          setEditingCell({ id: personSession.player_id, field })
                        }
                        className='cursor-pointer rounded p-1 hover:bg-gray-100'>
                        {
                          personSession[field as keyof TableEntry] !== undefined &&
                          personSession[field as keyof TableEntry] !== ''
                            ? FieldDisplay(field, personSession)
                            : renderFieldPlaceholder(field)
                          // <em className='text-gray-400'>Click to edit</em>
                        }
                      </span>
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={onSaveHandler}>Save</Button>
    </>
  );
}
