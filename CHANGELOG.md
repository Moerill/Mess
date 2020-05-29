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