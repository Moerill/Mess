# v0.8.1
* Fix settings menu not showing for non DnD Systems.
* Undid a change making video textures not work anymore.

# v0.8.0
<ul>
	<li>New Settings Menu!
		<ul>
			<li>Less mess inside FVTTs settings menu. Only one button is left!</li>
			<li>More structure.</li>
			<li>More fine grained control over most features provided by this module.</li>
		</ul>
	</li>
	<li>(Almost) Full localization support for Japanese and German!
		<ul>
			<li>Almost all menus, buttons, etc. are now localized.</li>
			<li>Special thanks to @BrotherSharp for providing the japanese translation!</li>
			<li>Want to help localizing to other languages? contact me on GitHub!</li>
		</ul>
	</li>
	<li>
		Dislike template borders or grid highlights "besmear" your beautiful textures? I've got you covered, with a new option to hide borders and grid highlights for textured templates.
		<ul>
			<li>Only textured templates are affected.</li>
			<li>If you hover over a templates control in the template layer the border and highlight will get shown</li>
		</ul>
	</li>
	<li>Option for automatic targetting for *all* templates
		<ul>
			<li>Drag a template around and it will automatically target all tokens that are inside.</li>
			<li>Ability templates autotargetting are now dependend on this new setting-</li>
		</ul>
	</li>
	<li>
		Use items to add bonus damage, like sneak attack, to other items!
		<ul>
			<li>Special thanks to @bsleys for providing the code!</li>
			<li>Check the new checkbox on an item, to mark it as *bonus damage*.</li>
			<li>Marked items are automatically added as damage roll to all damage rolls coming from that actor.</li>
			<li>Use the script macro ``game.mess.toggleItemBonusDamage('Item Name')`` to toggle an items effect.</li>
		</ul>
	</li>
	<li>Full  D&D5e Dark Mode and Tidy5e Support!</li>
	<li>Fix item chat cards not being expandable with Mess activated.</li>
	<li>Fixed cone template texture scaling being a bit off.</li>
	<li>Fixed crit formulas breaking for dice pools or more complex roll formulas. Thanks to @bsleys for fixing this!</li>
</ul>

# v0.7.0
* (5e): Added settings option to support for "maximum crits": Changes behaviour of critical damage rolls to maximize the damage of the extra dice for criticals! Thanks to @bsleys for adding this feature!

# v0.6.1
* Forgot to update module.json to show compatibility with newest FVTT version....

# v0.6.0
<ul>
	<li>New Feature: You can now specify your items chat flavor using rollable Tables!
		<ul>
			<li>Use the same syntax as you'd use everywhere else: @RollTable[id] or @RollTable[name]</li>
			<li>Automatically replaces the above tag using the result.</li>
			<li>Also supports the [target.name] command. (Reminder: if you use [target.name] inside of a chat flavor text, it will be replaced by the targets name.</li>
		</ul>
	</li>
	<li>
		Fixed Jack of all trades and Remarkable athlete.
	</li>
</ul>

# v0.5.2
<ul>
	<li>Fixed attack buttons being hidden even with alternative rolling disabled.</li>
	<li>Fixed clicking on an item name in an item chat card not toggling the description.</li>
</ul>

# v0.5.1
<ul>
	<li>Fixed error when trying to throw damage for actors with "Damage Bonus" defined in "Special Traits".</li>
</ul>

# v0.5
	* Fixed module.json not having updated compatibleCoreVersion
	* Accidently jumped from 0.4 to 0.5 ....

# v0.4
<ul>
	<li>
		<b style="font-weight: bold;">Important:</b> Automatic template textures for DnD 5e are now independent of the rolling mode! They will get activated when you activate the scaling and video textures for templates!
	</li>
	<li>(Hopefully) fixed the module sometimes not properly loading, by removing race conditions created due to dynamic script loading.</li>
	<li>Improved the roll controls above the chat window-content
		<ul>
			<li>Changed the advantage toggle to now using dice to display the current roll mode</li>
			<li>Added a situational modifier field, which gets applied to all D20 based rolls. (attack rolls, saving throws, skill and ability checks</li>
		</ul>
	</li>
	<li>
		Restructured a whole lot of the code, so its a little bit less of a mess... (Even though this is the modules name! :P )
	</li>
	<li>
	Removed the default 5e context menu for applying damage, since this resulted in unwanted and confusing behaviour. I will revisit this for the next patch and add <em>some</em> option to apply damage using the rolls. I'm just not sure currently as to how i want to tackle this. Feel free to add ideas to the <a href="https://github.com/Moerill/Mess/issues/9">issue</a>.
	</li>
</ul>

# v0.3.3
	* Now using the proper japanese localization code..

# v0.3.2
	* Fixed players with permission lvl "player" not being able to roll their own dice.

# v0.3.1
	* Fixed a typo resulting in an error..

# v0.3
	* Added chat localizations for japanese and german
		- Thanks to BrotherSharp for the japanese translation!
	* Added a global modifier field, adding a modifier to all D20 based rolls.
	* Reworked the design of the advantage selector.
	* Resource consumption should now work as expected for the 5e system when using an item/skill/spell.
	* Saving throws, skill and ability checks are now implemented using the modified rolling behaviour and respecting the automatic (dis-)advantage
		- click on the saving throw modifier to roll a saving throw
		- click on an ability name or the modifier to roll an ability check
	* Fixed players being able to make rolls in chat cards created by other people. GM still can do so.
	* Fixed global modifiers set in the actors sheet breaking the rolls
	* Fixed a crash attempting to cast a spell if no settings were created.
	* Fixed attack cards not respecting the roll mode seet.

# v0.2.0
	* Started to add localization support. For now its only added for everything chat related. But more will come!
	* Fixed css file not being in the release zip.
	* Fix some error resulting in me not removing my debugging code..

# v0.1.5
* Added compatibility with DnD5e v0.9. Its possible that it does not work with older Dnd5e versions. *So do not update if you're still on DnD5e v0.89!*

# v0.1.4
* Fixed some firefox incompatibility, cause FireFox doesn't know how to RegExp.........