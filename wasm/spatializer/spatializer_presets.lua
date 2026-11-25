--[[**************************************************************************
 * spatializer_presets.lua: Built-in spatializer presets for Super-Dribble
 *****************************************************************************
 * Copyright (C) 2024 Benny Perumalla
 *
 * Author: Benny Perumalla <benny01r@gmail.com>
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston MA 02110-1301, USA.
 ****************************************************************************]]

-------------------------------------------------------------------------------
-- Spatializer Presets
-- Inspired by IAMF terminology for describing acoustic scenes.
-------------------------------------------------------------------------------
spatial_presets = {
  {
    name = "Auditorium",
    description = "Large concert hall with natural acoustics and wide stereo image.",
    params = {
      width = 1.4,   -- Wide stereo image
      decay = 0.7,   -- Long decay for large space
      damping = 0.4, -- Moderate damping
      mix = 0.35     -- Balanced effect
    }
  },
  {
    name = "Echo",
    description = "Sharp, distinct echoes with minimal diffusion.",
    params = {
      width = 1.2,   -- Moderate widening
      decay = 0.6,   -- Medium decay
      damping = 0.2, -- Low damping for clear echoes
      mix = 0.25     -- Subtle effect
    }
  },
  {
    name = "Great hall",
    description = "Massive cathedral-like space with long, lush reverb.",
    params = {
      width = 1.6,   -- Very wide stereo
      decay = 0.9,   -- Very long decay
      damping = 0.3, -- Low damping for natural sound
      mix = 0.45     -- Strong effect
    }
  },
  {
    name = "Light reverb",
    description = "Subtle room ambience with minimal coloration.",
    params = {
      width = 1.1,   -- Slight widening
      decay = 0.3,   -- Short decay
      damping = 0.7, -- High damping for clean sound
      mix = 0.15     -- Very subtle effect
    }
  },
  {
    name = "Scene",
    description = "Cinematic soundstage with immersive spatial effects.",
    params = {
      width = 1.8,   -- Very wide stereo
      decay = 0.5,   -- Medium decay
      damping = 0.5, -- Balanced damping
      mix = 0.30     -- Moderate effect
    }
  },
  {
    name = "Small Room",
    description = "Intimate space with tight, controlled reverb.",
    params = {
      width = 1.0,   -- No widening
      decay = 0.2,   -- Very short decay
      damping = 0.8, -- High damping
      mix = 0.20     -- Subtle effect
    }
  },
  {
    name = "Stadium",
    description = "Outdoor stadium with wide stereo and long decay.",
    params = {
      width = 1.9,   -- Maximum widening
      decay = 0.8,   -- Long decay
      damping = 0.4, -- Moderate damping
      mix = 0.40     -- Strong effect
    }
  },
  {
    name = "Studio",
    description = "Professional recording studio with controlled acoustics.",
    params = {
      width = 1.1,   -- Subtle widening
      decay = 0.25,  -- Short decay
      damping = 0.6, -- High damping for clean sound
      mix = 0.20     -- Subtle effect
    }
  },
  {
    name = "Studio Room",
    description = "A tight, controlled acoustic space. Adds presence without washing out the source.",
    params = {
      width = 1.1,   -- Subtle widening
      decay = 0.25,  -- Short decay time
      damping = 0.6, -- More damping for a less bright tail
      mix = 0.20     -- Lower dry/wet mix
    }
  },
  {
    name = "Concert Hall",
    description = "Simulates a large, reverberant hall. Ideal for classical or ambient music.",
    params = {
      width = 1.25,  -- Wider scene to match the large space
      decay = 0.8,   -- Long, lush decay
      damping = 0.3, -- Less damping to allow high frequencies to linger
      mix = 0.40     -- A significant amount of effect
    }
  },
  {
    name = "Expansive Cinema",
    description = "Creates a wide, immersive soundstage with moderate reverb. Good for movies and gaming.",
    params = {
      width = 1.8,   -- Very wide stereo image
      decay = 0.5,   -- Medium decay, not as long as a hall
      damping = 0.5, -- Balanced damping
      mix = 0.35     -- Noticeable but not overwhelming effect
    }
  }
}
