import { LngLat, Map as MaplibreMap } from "maplibre-gl";
import { useLayoutEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import makeStyles from "utils/makeStyles";

import Map from "../../components/Map";
import PageTitle from "../../components/PageTitle";
import { routeToGuide, routeToPlace, routeToUser } from "../../routes";
import { addClusteredUsersToMap } from "./clusteredUsers";
import addCommunitiesToMap from "./communities";
import { MAP_PAGE } from "./constants";
import addGuidesToMap from "./guides";
import addPlacesToMap from "./places";

const useStyles = (windowHeight: number) =>
  makeStyles((theme) => ({
    container: {
      display: "flex",
      flexDirection: "column",
      height: `calc(${windowHeight}px - ${theme.shape.navPaddingMobile})`,
      paddingBlockEnd: theme.spacing(2),
      [theme.breakpoints.up("md")]: {
        height: `calc(100vh - ${theme.shape.navPaddingDesktop})`,
      },
    },
    root: {
      border: "1px solid black",
    },
  }));

export default function MapPage() {
  const history = useHistory();

  const location = useLocation();

  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  //Update on orientation change
  useLayoutEffect(() => {
    const updateWindowHeight = () => {
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener("resize", updateWindowHeight);
    return () => window.removeEventListener("resize", updateWindowHeight);
  }, []);

  const classes = useStyles(windowHeight)();

  const handlePlaceClick = (ev: any) => {
    const properties = ev.features[0].properties as {
      id: number;
      slug: string;
    };
    history.push(routeToPlace(properties.id, properties.slug), location.state);
  };

  const handleGuideClick = (ev: any) => {
    const properties = ev.features[0].properties as {
      id: number;
      slug: string;
    };
    history.push(routeToGuide(properties.id, properties.slug), location.state);
  };

  const handleClick = (ev: any) => {
    const username = ev.features[0].properties.username;
    history.push(routeToUser(username), location.state);
  };

  const initializeMap = (map: MaplibreMap) => {
    map.on("load", () => {
      if (process.env.REACT_APP_IS_COMMUNITIES_ENABLED === "true") {
        addCommunitiesToMap(map);
        addPlacesToMap(map, handlePlaceClick);
        addGuidesToMap(map, handleGuideClick);
      }
      addClusteredUsersToMap(map, handleClick);
    });
  };

  return (
    <div className={classes.container}>
      <PageTitle>{MAP_PAGE}</PageTitle>
      <Map
        hash
        initialZoom={1}
        initialCenter={new LngLat(0, 0)}
        grow
        postMapInitialize={initializeMap}
        className={classes.root}
      />
    </div>
  );
}
