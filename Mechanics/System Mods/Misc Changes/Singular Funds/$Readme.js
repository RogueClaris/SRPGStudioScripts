/*
This is only a js file for the fancy coloring.
To use this plugin in full, give units the
following custom parameter:

	UserGoldCL:1000

Where 1000 is the desired amount of gold for
that unit to start with. Remember to wrap all
custom parameters in the same set of curly braces.

You may also utilize the new event command to give
units gold visibly. Instructions for it are in the
file CL_GoldTradeEvent.

=Removable Files=
 CL_GoldTrade
 CL_GoldSteal
 CL_GoldTradeEvent
 CL_DrawFunds

Ideally you shouldn't need to remove any of these,
as each one is a core feature of the plugin set.
However, CL_DrawFunds in particular may clash
with other UI altering plugins, and may safely be
removed.

=Required Files=
 CL_MinorChanges

Do not remove that one, thank you.
*/