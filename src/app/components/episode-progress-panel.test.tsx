/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { EpisodeProgressPanel } from "./episode-progress-panel";

jest.mock("@/lib/watch-api", () => ({
  getEpisodeProgress: jest.fn(),
  getMediaDetails: jest.fn(),
  updateEpisodeProgress: jest.fn(),
}));

import {
  getEpisodeProgress,
  getMediaDetails,
  updateEpisodeProgress,
} from "@/lib/watch-api";

describe("EpisodeProgressPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing for non-tv media types", () => {
    (getEpisodeProgress as jest.Mock).mockResolvedValue({
      data: { watchListId: 1, mediaId: 10, watchedEpisodes: 0, watchedSeasons: 0 },
    });
    (getMediaDetails as jest.Mock).mockResolvedValue({ data: null });

    const { container } = render(
      <EpisodeProgressPanel
        listId={1}
        mediaId={10}
        mediaType="movie"
        tmdbId={100}
      />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("shows the episode counter with loaded progress", async () => {
    (getEpisodeProgress as jest.Mock).mockResolvedValue({
      data: { watchListId: 1, mediaId: 10, watchedEpisodes: 5, watchedSeasons: 1 },
    });
    (getMediaDetails as jest.Mock).mockResolvedValue({
      data: {
        providers: [],
        director: null,
        cast: [],
        numberOfSeasons: 3,
        numberOfEpisodes: 24,
        totalRuntimeInMinutes: 1080,
      },
    });

    render(
      <EpisodeProgressPanel
        listId={1}
        mediaId={10}
        mediaType="tv"
        tmdbId={100}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("5/24")).toBeInTheDocument();
    });
    expect(screen.getByText("Progreso de episodios")).toBeInTheDocument();
    expect(screen.getByText("3 temporadas")).toBeInTheDocument();
    expect(screen.getByText(/19 ep\. restantes/)).toBeInTheDocument();
  });

  it("increments the counter on plus button click", async () => {
    const user = userEvent.setup();
    (getEpisodeProgress as jest.Mock).mockResolvedValue({
      data: { watchListId: 1, mediaId: 10, watchedEpisodes: 3, watchedSeasons: 0 },
    });
    (getMediaDetails as jest.Mock).mockResolvedValue({
      data: {
        providers: [],
        director: null,
        cast: [],
        numberOfSeasons: 1,
        numberOfEpisodes: 10,
        totalRuntimeInMinutes: 450,
      },
    });
    (updateEpisodeProgress as jest.Mock).mockResolvedValue({
      data: { watchListId: 1, mediaId: 10, watchedEpisodes: 4, watchedSeasons: 0 },
    });

    render(
      <EpisodeProgressPanel
        listId={1}
        mediaId={10}
        mediaType="tv"
        tmdbId={100}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("3/10")).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Sumar episodio"));

    await waitFor(() => {
      expect(updateEpisodeProgress).toHaveBeenCalledWith(1, 10, 4);
    });
    expect(screen.getByText("4/10")).toBeInTheDocument();
  });

  it("decrements the counter on minus button click", async () => {
    const user = userEvent.setup();
    (getEpisodeProgress as jest.Mock).mockResolvedValue({
      data: { watchListId: 1, mediaId: 10, watchedEpisodes: 2, watchedSeasons: 0 },
    });
    (getMediaDetails as jest.Mock).mockResolvedValue({
      data: {
        providers: [],
        director: null,
        cast: [],
        numberOfEpisodes: 10,
        totalRuntimeInMinutes: 450,
      },
    });
    (updateEpisodeProgress as jest.Mock).mockResolvedValue({
      data: { watchListId: 1, mediaId: 10, watchedEpisodes: 1, watchedSeasons: 0 },
    });

    render(
      <EpisodeProgressPanel
        listId={1}
        mediaId={10}
        mediaType="tv"
        tmdbId={100}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("2/10")).toBeInTheDocument();
    });

    await user.click(screen.getByLabelText("Restar episodio"));

    await waitFor(() => {
      expect(updateEpisodeProgress).toHaveBeenCalledWith(1, 10, 1);
    });
  });

  it("shows completed message when all episodes are watched", async () => {
    (getEpisodeProgress as jest.Mock).mockResolvedValue({
      data: { watchListId: 1, mediaId: 10, watchedEpisodes: 10, watchedSeasons: 0 },
    });
    (getMediaDetails as jest.Mock).mockResolvedValue({
      data: {
        providers: [],
        director: null,
        cast: [],
        numberOfSeasons: 1,
        numberOfEpisodes: 10,
        totalRuntimeInMinutes: 450,
      },
    });

    render(
      <EpisodeProgressPanel
        listId={1}
        mediaId={10}
        mediaType="tv"
        tmdbId={100}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Serie completada")).toBeInTheDocument();
    });
  });

  it("handles missing TMDB details gracefully", async () => {
    (getEpisodeProgress as jest.Mock).mockResolvedValue({
      data: { watchListId: 1, mediaId: 10, watchedEpisodes: 3, watchedSeasons: 0 },
    });
    (getMediaDetails as jest.Mock).mockResolvedValue({ data: null });

    render(
      <EpisodeProgressPanel
        listId={1}
        mediaId={10}
        mediaType="tv"
        tmdbId={null}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });
    // No total episodes info, so no "remaining" text
    expect(screen.queryByText(/restante/)).not.toBeInTheDocument();
  });

  it("disables minus button when episodes are zero", async () => {
    (getEpisodeProgress as jest.Mock).mockResolvedValue({
      data: { watchListId: 1, mediaId: 10, watchedEpisodes: 0, watchedSeasons: 0 },
    });
    (getMediaDetails as jest.Mock).mockResolvedValue({ data: null });

    render(
      <EpisodeProgressPanel
        listId={1}
        mediaId={10}
        mediaType="tv"
        tmdbId={null}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Restar episodio")).toBeDisabled();
    });
  });
});
