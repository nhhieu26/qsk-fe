import { env } from "@/config/env"
import { settingsHttp } from "@/features/settings/api/settings-http"
import { settingsMock } from "@/features/settings/api/settings-mock"
import type { SettingsRepository } from "@/features/settings/api/settings-repository"

export const settingsApi: SettingsRepository = env.useMockApi
  ? settingsMock
  : settingsHttp
