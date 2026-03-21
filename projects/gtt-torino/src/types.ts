export type VehicleMode =
  | 'metro'
  | 'tram'
  | 'bus'
  | 'rail'
  | 'trolleybus'
  | 'other'

export interface StopServiceRecord {
  lineCode: string
  mode: VehicleMode
  modeLabel: string
}

export interface StopRecord {
  stopId: string
  stopCode: string
  stopName: string
  stopDescription: string | null
  latitude: number
  longitude: number
  url: string | null
  wheelchairBoarding: string | null
  modes: VehicleMode[]
  lines: string[]
  services: StopServiceRecord[]
  distanceMeters?: number
}

export interface ArrivalRecord {
  tripId: string
  lineCode: string
  routeId: string
  routeName: string
  headsign: string | null
  mode: VehicleMode
  modeLabel: string
  routeColor: string | null
  routeTextColor: string | null
  scheduledArrival: string
  predictedArrival: string
  delaySeconds: number | null
  minutesUntil: number
  vehicleId: string | null
  vehicleLabel: string | null
  vehiclePosition: {
    latitude: number
    longitude: number
    bearing: number | null
    speedMetersPerSecond: number | null
    timestamp: string | null
  } | null
  realtime: boolean
}

export interface StopArrivalsResponse {
  fetchedAt: string
  feedTimestamp: string | null
  stale: boolean
  warnings: string[]
  stop: StopRecord
  relatedStops: StopRecord[]
  arrivals: ArrivalRecord[]
}

export interface LineVehicleRecord {
  tripId: string
  vehicleId: string | null
  vehicleLabel: string | null
  lineCode: string
  routeId: string
  routeName: string
  headsign: string | null
  mode: VehicleMode
  modeLabel: string
  routeColor: string | null
  routeTextColor: string | null
  latitude: number
  longitude: number
  bearing: number | null
  speedMetersPerSecond: number | null
  timestamp: string | null
}

export interface LineVehiclesResponse {
  fetchedAt: string
  feedTimestamp: string | null
  stale: boolean
  warnings: string[]
  line: string
  vehicles: LineVehicleRecord[]
}

export interface LineCatalogRecord {
  lineCode: string
  mode: VehicleMode
  modeLabel: string
  routeColor: string | null
  routeTextColor: string | null
}

export interface LinesCatalogResponse {
  fetchedAt: string
  lines: LineCatalogRecord[]
}

export interface NearbyStopsResponse {
  fetchedAt: string
  userLocation: {
    latitude: number
    longitude: number
  }
  stops: StopRecord[]
}

export interface LinePathPointRecord {
  latitude: number
  longitude: number
}

export interface LinePathRecord {
  pathId: string
  lineCode: string
  headsign: string | null
  directionId: number | null
  mode: VehicleMode
  modeLabel: string
  routeColor: string | null
  routeTextColor: string | null
  points: LinePathPointRecord[]
}

export interface LinePathsResponse {
  fetchedAt: string
  line: string
  paths: LinePathRecord[]
}

export interface AddressSearchResponse {
  query: string
  displayName: string
  latitude: number
  longitude: number
}

export interface FocusLocation {
  latitude: number
  longitude: number
  label: string
  kind: 'user' | 'address'
}
