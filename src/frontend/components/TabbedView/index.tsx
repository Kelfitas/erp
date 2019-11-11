import React, { Children, ReactChild, ReactNode, ReactNodeArray } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
  key: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
}

function a11yProps(index: any) {
  return {
    id: `scrollable-auto-tab-${index}`,
    'aria-controls': `scrollable-auto-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
}));

interface ScrollableTabsButtonAutoProps {
  children?: React.ReactNode;
  includeTabCloseButton?: boolean;
  handleTabClose: (event: React.MouseEvent<unknown>, index: number) => void;
}

export default function ScrollableTabsButtonAuto(props: ScrollableTabsButtonAutoProps) {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const { children, includeTabCloseButton, handleTabClose } = props;

  let tabs = null;
  let tabPanels = null;
  let childrenArray = [];
  const childrenAsArray = (children as ReactNodeArray);
  if (childrenAsArray) {
    childrenArray = [...childrenAsArray];
  } else {
    childrenArray.push(children);
  }

  tabPanels = childrenArray.map((child: ReactNode, index: number) => (
    <TabPanel value={value} index={index} key={index}>
      {child}
    </TabPanel>
  ));
  tabs = childrenArray.map((child: ReactNode, index: number) => (
    <Tab label={
      [
      (index + 1),
      includeTabCloseButton ? (
        <Box position="absolute" right="0">
          <IconButton size="small" onClick={e => handleTabClose(e, index)}>
            <CloseIcon fontSize="inherit" />
          </IconButton>
        </Box>
      ) : null
      ]
    } {...a11yProps(index)} key={index}/>
  ));

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
        >
          {tabs}
        </Tabs>
      </AppBar>
      {tabPanels}
    </div>
  );
}
